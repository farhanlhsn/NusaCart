package com.TryCatch.NusaCart.service;

import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpEntity;     
import org.springframework.http.HttpHeaders;    
import org.springframework.http.HttpMethod;     
import org.springframework.http.MediaType;      
import org.springframework.http.ResponseEntity; 
import org.springframework.web.client.RestTemplate; 
import com.TryCatch.NusaCart.dto.ForgetPasswordDTO;
import com.TryCatch.NusaCart.dto.UserUpdateDTO;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;


@Service
@Slf4j
public class UserService {
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    PasswordEncoder passwordEncoder;
    
    @Autowired
    ImageUploadService imageUploadService;

    @Value("${whatsapp.api.url}")
    private String whatsappApiUrl;
    
    @Value("${whatsapp.api.username}")
    private String whatsappApiUsername;

    @Value("${whatsapp.api.password}")
    private String whatsappApiPassword;
    
    // Storage sementara untuk verification codes
    // ConcurrentHashMap digunakan karena:
    // 1. Thread-safe: Multiple users bisa change password bersamaan
    // 2. Performance: Lebih cepat dari synchronized HashMap
    // 3. Spring Boot: Setiap HTTP request = thread berbeda
    // Alternative: Redis cache untuk production scale
    private final Map<String, VerificationData> pendingPasswordChanges = new ConcurrentHashMap<>();
    private final Map<String, RegistrationVerificationData> pendingRegistrations = new ConcurrentHashMap<>();
    
    // Inner class untuk menyimpan data verifikasi sementara
    private static class VerificationData {
        private final String newPassword;
        private final int verificationCode;
        private final long timestamp;
        private final String userId;
        
        // Constructor untuk forget password (user belum login)
        public VerificationData(String newPassword, int verificationCode, String userId) {
            this.newPassword = newPassword;
            this.verificationCode = verificationCode;
            this.timestamp = System.currentTimeMillis();
            this.userId = userId;
        }
        
        public String getNewPassword() { return newPassword; }
        public int getVerificationCode() { return verificationCode; }
        public String getUserId() { return userId; }
        public boolean isExpired() { 
            // Expired after 5 minutes
            return System.currentTimeMillis() - timestamp > 300000; 
        }
    }
    
    // Inner class untuk menyimpan data verifikasi registrasi
    private static class RegistrationVerificationData {
        private final UserEntity user;
        private final int verificationCode;
        private final long timestamp;
        
        public RegistrationVerificationData(UserEntity user, int verificationCode) {
            this.user = user;
            this.verificationCode = verificationCode;
            this.timestamp = System.currentTimeMillis();
        }
        
        public UserEntity getUser() { return user; }
        public int getVerificationCode() { return verificationCode; }
        public boolean isExpired() { 
            // Expired after 10 minutes
            return System.currentTimeMillis() - timestamp > 600000; 
        }
    }

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof UserEntity) {
            UserEntity user = (UserEntity) authentication.getPrincipal();
            log.info("Getting fresh data for user: {} with roles: {}", user.getEmail(), user.getRoles());
            
            return userRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> {
                    log.error("User not found in database: {}", user.getUserId());
                    return new RuntimeException("User not found");
                });
        }
        log.error("User not authenticated or principal is not UserEntity");
        throw new RuntimeException("User not authenticated");
    }

    @Transactional
    public UserEntity updateUserProfile(UserUpdateDTO request) {
        UserEntity user = getCurrentUser();
        log.info("Updating profile for user: {}", user.getEmail());
        
        // Validasi email jika berubah
        if (!user.getEmail().equals(request.getEmail())) {
            Optional<UserEntity> existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getUserId().equals(user.getUserId())) {
                throw new IllegalArgumentException("Email sudah digunakan oleh pengguna lain");
            }
        }
        
        // Update basic info
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            // Normalize phone number
            String normalizedPhoneNumber;
            try {
                normalizedPhoneNumber = normalizePhoneNumber(request.getPhoneNumber());
            } catch (IllegalArgumentException e) {
                log.error("Phone number normalization failed during profile update: {}", e.getMessage());
                throw new IllegalArgumentException("Format nomor telepon tidak valid: " + e.getMessage());
            }
            
            // Check if phone number is different from current and already exists
            if (!normalizedPhoneNumber.equals(user.getPhoneNumber())) {
                if (userRepository.existsByPhoneNumber(normalizedPhoneNumber)) {
                    throw new IllegalArgumentException("Nomor telepon " + request.getPhoneNumber() + " sudah digunakan oleh pengguna lain");
                }
            }
            
            user.setPhoneNumber(normalizedPhoneNumber);
        }
        
        // Handle password change if provided
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isEmpty()) {
                throw new IllegalArgumentException("Password saat ini diperlukan untuk mengubah password");
            }
            
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Password saat ini tidak valid");
            }
            
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                throw new IllegalArgumentException("Password baru dan konfirmasi password tidak cocok");
            }
            
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            log.info("Password updated for user: {}", user.getEmail());
        }
        
        UserEntity updatedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", updatedUser.getEmail());
        
        return updatedUser;
    }

    /**
     * Normalisasi nomor telepon Indonesia ke format internasional
     * Contoh:
     * - 08123456789 -> 6281234567890
     * - 8123456789 -> 6281234567890  
     * - +6281234567890 -> 6281234567890
     * - 6281234567890 -> 6281234567890 (sudah benar)
     */
    private String normalizePhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Nomor telepon tidak boleh kosong");
        }
        
        // Remove all non-digit characters except +
        String cleaned = phoneNumber.replaceAll("[^+\\d]", "");
        
        // Remove leading + if exists
        if (cleaned.startsWith("+")) {
            cleaned = cleaned.substring(1);
        }
        
        // Handle different Indonesian phone number formats
        if (cleaned.startsWith("08")) {
            // 08xxxxxxxxx -> 628xxxxxxxxx
            cleaned = "62" + cleaned.substring(1);
        } else if (cleaned.startsWith("8") && cleaned.length() >= 9) {
            // 8xxxxxxxxx -> 628xxxxxxxxx (missing leading 0)
            cleaned = "62" + cleaned;
        } else if (cleaned.startsWith("62")) {
            // Already in international format, keep as is
            // 62xxxxxxxxxx -> 62xxxxxxxxxx
        } else {
            throw new IllegalArgumentException("Format nomor telepon tidak valid. Gunakan format: 08xxxxxxxxx atau 62xxxxxxxxx");
        }
        
        // Validate length (Indonesian mobile numbers should be 12-13 digits with country code)
        if (cleaned.length() < 11 || cleaned.length() > 14) {
            throw new IllegalArgumentException("Panjang nomor telepon tidak valid. Nomor telepon Indonesia harus 10-13 digit (tanpa kode negara)");
        }
        
        // Validate Indonesian mobile prefixes
        if (!cleaned.matches("^62(8[1-9]|9[0-9])\\d{7,10}$")) {
            throw new IllegalArgumentException("Nomor telepon bukan nomor mobile Indonesia yang valid");
        }
        
        log.debug("Phone number normalized from {} to {}", phoneNumber, cleaned);
        return cleaned;
    }

    public ResponseEntity<String> sendWhatsappMessage(String phoneNumber, String message) {
        log.info("Sending Whatsapp message to phone number: {}", phoneNumber);
        log.debug("WhatsApp API URL: {}", whatsappApiUrl);
        log.debug("WhatsApp API Username: {}", whatsappApiUsername);

        // Validasi input
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            throw new RuntimeException("Phone number cannot be null or empty");
        }
        if (message == null || message.trim().isEmpty()) {
            throw new RuntimeException("Message cannot be null or empty");
        }

        // Normalize dan format nomor telepon
        String normalizedPhone;
        try {
            normalizedPhone = normalizePhoneNumber(phoneNumber);
        } catch (IllegalArgumentException e) {
            log.error("Phone number normalization failed for {}: {}", phoneNumber, e.getMessage());
            throw new RuntimeException("Format nomor telepon tidak valid: " + e.getMessage());
        }
        
        String formattedPhone = normalizedPhone + "@s.whatsapp.net";
        
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("phone", formattedPhone);
        requestBody.put("message", message);
        
        log.debug("Request body: {}", requestBody);

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBasicAuth(whatsappApiUsername, whatsappApiPassword);

            HttpEntity<Object> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> apiResponse = restTemplate.exchange(
                whatsappApiUrl, HttpMethod.POST, requestEntity, String.class);

            if (apiResponse.getStatusCode().is2xxSuccessful()) {
                log.info("Whatsapp message sent successfully to {}", formattedPhone);
                log.debug("WhatsApp API response: {}", apiResponse.getBody());
            } else {
                log.error("Failed to send Whatsapp message, status: {}, response: {}", 
                    apiResponse.getStatusCode(), apiResponse.getBody());
                throw new RuntimeException("Failed to send Whatsapp message: " + apiResponse.getStatusCode());
            }
            return apiResponse;
            
        } catch (Exception e) {
            log.error("Error sending WhatsApp message to {}: {}", formattedPhone, e.getMessage(), e);
            throw new RuntimeException("Error sending WhatsApp message: " + e.getMessage(), e);
        }
    }

    public Map<String, String> forgetPassword(ForgetPasswordDTO request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));
        // Generate verification code
        Random random = new Random();
        int verificationCode = random.nextInt(9000) + 1000;
        
        // Simpan data sementara
        String userId = String.valueOf(user.getUserId());
        VerificationData verificationData = new VerificationData(request.getNewPassword(), verificationCode, userId);
        pendingPasswordChanges.put(userId, verificationData);
        
        // Kirim verification code
        try {
            ResponseEntity<String> whatsappResponse = sendWhatsappMessage(user.getPhoneNumber(), "Kode verifikasi untuk mengganti password: " + verificationCode);
            if (!whatsappResponse.getStatusCode().is2xxSuccessful()) {
                // Hapus data sementara jika gagal kirim SMS
                pendingPasswordChanges.remove(userId);
                throw new RuntimeException("Failed to send verification code");
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Kode verifikasi telah dikirim ke nomor telepon Anda");
            response.put("status", "verification_sent");
            response.put("nextStep", "Masukkan kode verifikasi untuk menyelesaikan perubahan password");
            return response;
            
        } catch (Exception e) {
            // Hapus data sementara jika error
            pendingPasswordChanges.remove(userId);
            log.error("Error sending verification code: " + e.getMessage());
            throw new RuntimeException("Error sending verification code: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, String> confirmForgetPassword(Integer verificationCodeInput) {
        String verificationKey = null;
        VerificationData verificationData = null;
        
        // Cari verification code di semua pending changes
        for (Map.Entry<String, VerificationData> entry : pendingPasswordChanges.entrySet()) {
            if (entry.getValue().getVerificationCode() == verificationCodeInput) {
                verificationKey = entry.getKey();
                verificationData = entry.getValue();
                break;
            }
        }
        
        if (verificationData == null) {
            throw new RuntimeException("Invalid verification code or no pending password change found.");
        }
        
        if (verificationData.isExpired()) {
            pendingPasswordChanges.remove(verificationKey);
            throw new RuntimeException("Verification code has expired. Please start the process again.");
        }
        
        // Ambil user berdasarkan userId yang disimpan dalam verification data
        UserEntity user = userRepository.findByUserId(Integer.valueOf(verificationData.getUserId()))
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update password
        user.setPassword(passwordEncoder.encode(verificationData.getNewPassword()));
        userRepository.save(user);
        
        // Hapus data sementara
        pendingPasswordChanges.remove(verificationKey);
        
        log.info("Password reset successfully for user: {}", user.getEmail());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password berhasil direset");
        response.put("status", "success");
        return response;
    }
    
    public Map<String, String> sendRegistrationOTP(UserEntity user) {
        // Generate verification code
        Random random = new Random();
        int verificationCode = random.nextInt(9000) + 1000;
        
        // Simpan data sementara
        String userKey = user.getEmail();
        RegistrationVerificationData verificationData = new RegistrationVerificationData(user, verificationCode);
        pendingRegistrations.put(userKey, verificationData);
        
        // Kirim verification code
        try {
            ResponseEntity<String> whatsappResponse = sendWhatsappMessage(user.getPhoneNumber(), 
                "Selamat datang di NusaCart! Kode verifikasi registrasi Anda: *" + verificationCode + 
                "*. Masukkan kode ini untuk menyelesaikan pendaftaran.");
            
            if (!whatsappResponse.getStatusCode().is2xxSuccessful()) {
                // Hapus data sementara jika gagal kirim WhatsApp
                pendingRegistrations.remove(userKey);
                throw new RuntimeException("Failed to send verification code");
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Kode verifikasi telah dikirim ke nomor WhatsApp Anda");
            response.put("status", "verification_sent");
            response.put("email", user.getEmail());
            response.put("phoneNumber", user.getPhoneNumber());
            return response;
            
        } catch (Exception e) {
            // Hapus data sementara jika error
            pendingRegistrations.remove(userKey);
            log.error("Error sending registration verification code: " + e.getMessage());
            throw new RuntimeException("Error sending verification code: " + e.getMessage());
        }
    }
    
    @Transactional
    public Map<String, String> verifyRegistrationOTP(String email, Integer verificationCodeInput) {
        RegistrationVerificationData verificationData = pendingRegistrations.get(email);
        
        if (verificationData == null) {
            // Check if this is an existing unverified user (from login -> verification flow)
            Optional<UserEntity> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                UserEntity user = existingUser.get();
                if (user.isVerified()) {
                    throw new RuntimeException("User is already verified.");
                } else {
                    // For existing unverified users, we need to send OTP first
                    // This handles the case where user logged in and was redirected to verification
                    throw new RuntimeException("Please request a new verification code first.");
                }
            }
            throw new RuntimeException("No pending registration found for this email.");
        }
        
        if (verificationData.isExpired()) {
            pendingRegistrations.remove(email);
            throw new RuntimeException("Verification code has expired. Please request a new code.");
        }
        
        if (verificationData.getVerificationCode() != verificationCodeInput) {
            throw new RuntimeException("Invalid verification code.");
        }
        
        // Verifikasi berhasil
        UserEntity user = verificationData.getUser();
        user.setVerified(true);
        
        // Check if user is already in database (existing user) or needs to be saved (new registration)
        UserEntity savedUser;
        if (user.getUserId() != null) {
            // Existing user - update verification status
            savedUser = userRepository.save(user);
            log.info("Existing user verified successfully: {}", user.getEmail());
        } else {
            // New registration - save user to database
            savedUser = userRepository.save(user);
            log.info("New registration verified successfully: {}", user.getEmail());
        }
        
        // Hapus data sementara
        pendingRegistrations.remove(email);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Verifikasi berhasil! Akun Anda telah aktif.");
        response.put("status", "success");
        response.put("userId", savedUser.getUserId().toString());
        return response;
    }
    
    public Map<String, String> resendRegistrationOTP(String email) {
        RegistrationVerificationData verificationData = pendingRegistrations.get(email);
        
        if (verificationData == null) {
            // Check if this is an existing unverified user (from login -> verification flow)
            Optional<UserEntity> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                UserEntity user = existingUser.get();
                if (user.isVerified()) {
                    throw new RuntimeException("User is already verified.");
                } else {
                    // Create verification session for existing unverified user
                    Random random = new Random();
                    int verificationCode = random.nextInt(9000) + 1000;
                    
                    RegistrationVerificationData newVerificationData = new RegistrationVerificationData(user, verificationCode);
                    pendingRegistrations.put(email, newVerificationData);
                    
                    // Send verification code
                    try {
                        ResponseEntity<String> whatsappResponse = sendWhatsappMessage(user.getPhoneNumber(), 
                            "Kode verifikasi akun NusaCart Anda: *" + verificationCode + 
                            "*. Masukkan kode ini untuk menyelesaikan verifikasi akun.");
                        
                        if (!whatsappResponse.getStatusCode().is2xxSuccessful()) {
                            throw new RuntimeException("Failed to send verification code");
                        }

                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Kode verifikasi telah dikirim ke nomor WhatsApp Anda");
                        response.put("status", "verification_sent");
                        response.put("phoneNumber", user.getPhoneNumber());
                        return response;
                        
                    } catch (Exception e) {
                        log.error("Error sending verification code to existing user: " + e.getMessage());
                        throw new RuntimeException("Error sending verification code: " + e.getMessage());
                    }
                }
            }
            throw new RuntimeException("No pending registration found for this email.");
        }
        
        // Generate new verification code
        Random random = new Random();
        int newVerificationCode = random.nextInt(9000) + 1000;
        
        // Update verification data
        UserEntity user = verificationData.getUser();
        RegistrationVerificationData newVerificationData = new RegistrationVerificationData(user, newVerificationCode);
        pendingRegistrations.put(email, newVerificationData);
        
        // Kirim verification code baru
        try {
            ResponseEntity<String> whatsappResponse = sendWhatsappMessage(user.getPhoneNumber(), 
                "Kode verifikasi registrasi NusaCart yang baru: " + newVerificationCode + 
                ". Masukkan kode ini untuk menyelesaikan pendaftaran.");
            
            if (!whatsappResponse.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to send verification code");
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Kode verifikasi baru telah dikirim ke nomor WhatsApp Anda");
            response.put("status", "verification_sent");
            response.put("phoneNumber", user.getPhoneNumber());
            return response;
            
        } catch (Exception e) {
            log.error("Error resending registration verification code: " + e.getMessage());
            throw new RuntimeException("Error sending verification code: " + e.getMessage());
        }
    }
    
    public Map<String, String> getRegistrationInfo(String email) {
        RegistrationVerificationData verificationData = pendingRegistrations.get(email);
        
        if (verificationData == null) {
            // Check if user already exists in database
            Optional<UserEntity> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                UserEntity user = existingUser.get();
                if (user.isVerified()) {
                    throw new RuntimeException("User is already registered and verified. Please login instead.");
                } else {
                    // User exists but not verified - this is valid for login -> verification flow
                    // Return user info so verification page can work
                    log.info("Returning registration info for existing unverified user: {}", email);
                    Map<String, String> response = new HashMap<>();
                    response.put("email", user.getEmail());
                    response.put("phoneNumber", user.getPhoneNumber());
                    response.put("name", user.getName());
                    response.put("status", "existing_unverified");
                    return response;
                }
            }
            throw new RuntimeException("No pending registration found for this email.");
        }
        
        UserEntity user = verificationData.getUser();
        Map<String, String> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("name", user.getName());
        response.put("status", "pending_verification");
        return response;
    }
    
    public Map<String, String> updatePhoneRegistration(String email, String newPhoneNumber) {
        RegistrationVerificationData verificationData = pendingRegistrations.get(email);
        
        if (verificationData == null) {
            // Check if this is an existing unverified user (from login -> verification flow)
            Optional<UserEntity> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                UserEntity user = existingUser.get();
                if (user.isVerified()) {
                    throw new RuntimeException("User is already verified. Cannot update phone number through registration.");
                } else {
                    // Handle phone update for existing unverified user
                    // Normalize phone number before updating
                    String normalizedPhoneNumber;
                    try {
                        normalizedPhoneNumber = normalizePhoneNumber(newPhoneNumber);
                    } catch (IllegalArgumentException e) {
                        log.error("Phone number normalization failed during phone update: {}", e.getMessage());
                        throw new RuntimeException("Format nomor telepon tidak valid: " + e.getMessage());
                    }
                    
                    // Check if phone number already exists
                    if (userRepository.existsByPhoneNumber(normalizedPhoneNumber)) {
                        throw new RuntimeException("Nomor telepon " + newPhoneNumber + " sudah terdaftar oleh pengguna lain");
                    }
                    
                    // Generate new verification code
                    Random random = new Random();
                    int newVerificationCode = random.nextInt(9000) + 1000;
                    
                    // Update user data with new phone number
                    user.setPhoneNumber(normalizedPhoneNumber);
                    
                    // Create verification data for existing user
                    RegistrationVerificationData newVerificationData = new RegistrationVerificationData(user, newVerificationCode);
                    pendingRegistrations.put(email, newVerificationData);
                    
                    // Send verification code to new phone number
                    try {
                        ResponseEntity<String> whatsappResponse = sendWhatsappMessage(normalizedPhoneNumber, 
                            "Nomor telepon Anda telah diperbarui untuk akun NusaCart. Kode verifikasi baru: *" + newVerificationCode + 
                            "*. Masukkan kode ini untuk menyelesaikan verifikasi.");
                        
                        if (!whatsappResponse.getStatusCode().is2xxSuccessful()) {
                            throw new RuntimeException("Failed to send verification code to new phone number");
                        }

                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Nomor telepon berhasil diperbarui. Kode verifikasi baru telah dikirim ke nomor WhatsApp yang baru.");
                        response.put("status", "phone_updated");
                        response.put("phoneNumber", normalizedPhoneNumber);
                        return response;
                        
                    } catch (Exception e) {
                        log.error("Error updating phone number for existing user: " + e.getMessage());
                        throw new RuntimeException("Error updating phone number: " + e.getMessage());
                    }
                }
            }
            throw new RuntimeException("No pending registration found for this email.");
        }
        
        // Normalize phone number before updating
        String normalizedPhoneNumber;
        try {
            normalizedPhoneNumber = normalizePhoneNumber(newPhoneNumber);
        } catch (IllegalArgumentException e) {
            log.error("Phone number normalization failed during phone update: {}", e.getMessage());
            throw new RuntimeException("Format nomor telepon tidak valid: " + e.getMessage());
        }
        
        // Check if phone number already exists
        if (userRepository.existsByPhoneNumber(normalizedPhoneNumber)) {
            throw new RuntimeException("Nomor telepon " + newPhoneNumber + " sudah terdaftar oleh pengguna lain");
        }
        
        // Generate new verification code
        Random random = new Random();
        int newVerificationCode = random.nextInt(9000) + 1000;
        
        // Update user data with new phone number
        UserEntity user = verificationData.getUser();
        user.setPhoneNumber(normalizedPhoneNumber);
        
        // Update verification data
        RegistrationVerificationData newVerificationData = new RegistrationVerificationData(user, newVerificationCode);
        pendingRegistrations.put(email, newVerificationData);
        
        // Kirim verification code ke nomor baru
        try {
            ResponseEntity<String> whatsappResponse = sendWhatsappMessage(normalizedPhoneNumber, 
                "Nomor telepon Anda telah diperbarui untuk registrasi NusaCart. Kode verifikasi baru: *" + newVerificationCode + 
                "*. Masukkan kode ini untuk menyelesaikan pendaftaran.");
            
            if (!whatsappResponse.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to send verification code to new phone number");
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Nomor telepon berhasil diperbarui. Kode verifikasi baru telah dikirim ke nomor WhatsApp yang baru.");
            response.put("status", "phone_updated");
            response.put("phoneNumber", normalizedPhoneNumber);
            return response;
            
        } catch (Exception e) {
            log.error("Error updating phone number for registration: " + e.getMessage());
            throw new RuntimeException("Error updating phone number: " + e.getMessage());
        }
    }
    
    public Map<String, String> updateEmailRegistration(String oldEmail, String newEmail, String phoneNumber) {
        // Check if new email already exists
        if (userRepository.findByEmail(newEmail).isPresent()) {
            throw new RuntimeException("Email " + newEmail + " sudah terdaftar oleh pengguna lain");
        }
        
        // Check if there's a pending registration for old email
        RegistrationVerificationData verificationData = pendingRegistrations.get(oldEmail);
        
        if (verificationData == null) {
            // Check if this is an existing unverified user
            Optional<UserEntity> existingUser = userRepository.findByEmail(oldEmail);
            if (existingUser.isPresent()) {
                UserEntity user = existingUser.get();
                if (user.isVerified()) {
                    throw new RuntimeException("User is already verified. Cannot update email through registration.");
                } else {
                    // Create new registration session with new email but same phone number
                    Random random = new Random();
                    int verificationCode = random.nextInt(9000) + 1000;
                    
                    // Update user email
                    user.setEmail(newEmail);
                    
                    // Create verification data for new email
                    RegistrationVerificationData newVerificationData = new RegistrationVerificationData(user, verificationCode);
                    pendingRegistrations.put(newEmail, newVerificationData);
                    
                    // Remove old email session if exists
                    pendingRegistrations.remove(oldEmail);
                    
                    // Send verification code to existing phone number
                    try {
                        ResponseEntity<String> whatsappResponse = sendWhatsappMessage(phoneNumber, 
                            "Email Anda telah diperbarui untuk akun NusaCart. Kode verifikasi baru: *" + verificationCode + 
                            "*. Masukkan kode ini untuk menyelesaikan verifikasi dengan email baru.");
                        
                        if (!whatsappResponse.getStatusCode().is2xxSuccessful()) {
                            throw new RuntimeException("Failed to send verification code");
                        }

                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Email berhasil diperbarui. Kode verifikasi telah dikirim ke nomor WhatsApp Anda.");
                        response.put("status", "email_updated");
                        response.put("newEmail", newEmail);
                        response.put("phoneNumber", phoneNumber);
                        return response;
                        
                    } catch (Exception e) {
                        log.error("Error updating email for existing user: " + e.getMessage());
                        throw new RuntimeException("Error updating email: " + e.getMessage());
                    }
                }
            }
            throw new RuntimeException("No pending registration found for this email.");
        }
        
        // For pending registrations, update email and create new session
        UserEntity user = verificationData.getUser();
        
        // Generate new verification code
        Random random = new Random();
        int newVerificationCode = random.nextInt(9000) + 1000;
        
        // Update user email
        user.setEmail(newEmail);
        
        // Create verification data for new email
        RegistrationVerificationData newVerificationData = new RegistrationVerificationData(user, newVerificationCode);
        pendingRegistrations.put(newEmail, newVerificationData);
        
        // Remove old email session
        pendingRegistrations.remove(oldEmail);
        
        // Send verification code to existing phone number
        try {
            ResponseEntity<String> whatsappResponse = sendWhatsappMessage(phoneNumber, 
                "Email registrasi NusaCart Anda telah diperbarui. Kode verifikasi baru: *" + newVerificationCode + 
                "*. Masukkan kode ini untuk menyelesaikan pendaftaran dengan email baru.");
            
            if (!whatsappResponse.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to send verification code");
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Email berhasil diperbarui. Kode verifikasi telah dikirim ke nomor WhatsApp Anda.");
            response.put("status", "email_updated");
            response.put("newEmail", newEmail);
            response.put("phoneNumber", phoneNumber);
            return response;
            
        } catch (Exception e) {
            log.error("Error updating email for registration: " + e.getMessage());
            throw new RuntimeException("Error updating email: " + e.getMessage());
        }
    }
    
    @Transactional
    public Map<String, String> updateProfileImage(String imageUrl) {
        UserEntity user = getCurrentUser();
        String oldImageUrl = user.getProfilePicture();
        
        // Update URL gambar profil di database
        user.setProfilePicture(imageUrl);
        userRepository.save(user);
        
        log.info("Profile image updated for user: {} from {} to {}", user.getEmail(), oldImageUrl, imageUrl);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Gambar profil berhasil diupdate");
        response.put("imageUrl", imageUrl);
        response.put("oldImageUrl", oldImageUrl);
        
        return response;
    }

    // Profile OTP verification methods
    private final Map<String, ProfileVerificationData> pendingProfileChanges = new ConcurrentHashMap<>();
    
    // Inner class untuk menyimpan data verifikasi profil
    private static class ProfileVerificationData {
        private final String changeType;
        private final int verificationCode;
        private final long timestamp;
        private final String userId;
        private final String newPhoneNumber; // Optional, only for phone changes
        
        public ProfileVerificationData(String changeType, int verificationCode, String userId, String newPhoneNumber) {
            this.changeType = changeType;
            this.verificationCode = verificationCode;
            this.timestamp = System.currentTimeMillis();
            this.userId = userId;
            this.newPhoneNumber = newPhoneNumber;
        }
        
        public String getChangeType() { return changeType; }
        public int getVerificationCode() { return verificationCode; }
        public String getUserId() { return userId; }
        public String getNewPhoneNumber() { return newPhoneNumber; }
        public boolean isExpired() { 
            // Expired after 5 minutes
            return System.currentTimeMillis() - timestamp > 300000; 
        }
    }

    public void requestProfileOTP(com.TryCatch.NusaCart.dto.ProfileOTPRequestDTO request) {
        UserEntity user = getCurrentUser();
        String changeType = request.getChangeType();
        
        // Validate change type
        if (!changeType.equals("phone") && !changeType.equals("password") && !changeType.equals("both")) {
            throw new IllegalArgumentException("Invalid change type. Must be 'phone', 'password', or 'both'");
        }
        
        // For phone changes, validate the new phone number
        String targetPhoneNumber = user.getPhoneNumber(); // Default to current phone
        if (changeType.equals("phone") || changeType.equals("both")) {
            if (request.getNewPhoneNumber() == null || request.getNewPhoneNumber().trim().isEmpty()) {
                throw new IllegalArgumentException("New phone number is required for phone changes");
            }
            
            // Normalize and validate new phone number
            String normalizedPhoneNumber;
            try {
                normalizedPhoneNumber = normalizePhoneNumber(request.getNewPhoneNumber());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid phone number format: " + e.getMessage());
            }
            
            // Check if phone number already exists (and it's not the current user's phone)
            if (!normalizedPhoneNumber.equals(user.getPhoneNumber()) && 
                userRepository.existsByPhoneNumber(normalizedPhoneNumber)) {
                throw new IllegalArgumentException("Phone number " + request.getNewPhoneNumber() + " is already used by another user");
            }
            
            targetPhoneNumber = normalizedPhoneNumber;
        }
        
        // Generate verification code
        Random random = new Random();
        int verificationCode = random.nextInt(9000) + 1000;
        
        // Store verification data
        String verificationKey = user.getUserId().toString() + "_profile_" + changeType;
        ProfileVerificationData verificationData = new ProfileVerificationData(
            changeType, verificationCode, user.getUserId().toString(), 
            changeType.equals("phone") || changeType.equals("both") ? targetPhoneNumber : null
        );
        pendingProfileChanges.put(verificationKey, verificationData);
        
        // Send WhatsApp message
        String message = createProfileOTPMessage(changeType, verificationCode);
        try {
            ResponseEntity<String> whatsappResponse = sendWhatsappMessage(targetPhoneNumber, message);
            
            if (!whatsappResponse.getStatusCode().is2xxSuccessful()) {
                pendingProfileChanges.remove(verificationKey); // Clean up on failure
                throw new RuntimeException("Failed to send verification code via WhatsApp");
            }
            
            log.info("Profile OTP sent successfully to user: {} for change type: {}", user.getEmail(), changeType);
            
        } catch (Exception e) {
            pendingProfileChanges.remove(verificationKey); // Clean up on failure
            log.error("Error sending profile OTP to user {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to send verification code: " + e.getMessage());
        }
    }
    
    private String createProfileOTPMessage(String changeType, int verificationCode) {
        String baseMessage = "Kode verifikasi NusaCart untuk ";
        
        switch (changeType) {
            case "phone":
                return baseMessage + "perubahan nomor telepon: *" + verificationCode + 
                       "*. Jangan bagikan kode ini kepada siapapun.";
            case "password":
                return baseMessage + "perubahan password: *" + verificationCode + 
                       "*. Jangan bagikan kode ini kepada siapapun.";
            case "both":
                return baseMessage + "perubahan nomor telepon dan password: *" + verificationCode + 
                       "*. Jangan bagikan kode ini kepada siapapun.";
            default:
                return baseMessage + "perubahan profil: *" + verificationCode + 
                       "*. Jangan bagikan kode ini kepada siapapun.";
        }
    }

    @Transactional
    public UserEntity verifyProfileOTP(com.TryCatch.NusaCart.dto.ProfileOTPVerifyDTO request) {
        UserEntity user = getCurrentUser();
        String changeType = request.getChangeType();
        Integer verificationCodeInput = request.getVerificationCode();
        
        // Find verification data
        String verificationKey = user.getUserId().toString() + "_profile_" + changeType;
        ProfileVerificationData verificationData = pendingProfileChanges.get(verificationKey);
        
        if (verificationData == null) {
            throw new IllegalArgumentException("No pending verification found for this change type");
        }
        
        if (verificationData.isExpired()) {
            pendingProfileChanges.remove(verificationKey);
            throw new IllegalArgumentException("Verification code has expired. Please request a new one");
        }
        
        if (!verificationData.getUserId().equals(user.getUserId().toString())) {
            throw new IllegalArgumentException("Verification code does not belong to current user");
        }
        
        if (verificationData.getVerificationCode() != verificationCodeInput.intValue()) {
            throw new IllegalArgumentException("Invalid verification code");
        }
        
        // Verification successful, now update the profile
        UserUpdateDTO updateData = request.getUpdateData();
        
        try {
            // Validate email if changed
            if (!user.getEmail().equals(updateData.getEmail())) {
                Optional<UserEntity> existingUser = userRepository.findByEmail(updateData.getEmail());
                if (existingUser.isPresent() && !existingUser.get().getUserId().equals(user.getUserId())) {
                    throw new IllegalArgumentException("Email is already used by another user");
                }
            }
            
            // Update basic info
            user.setName(updateData.getName());
            user.setEmail(updateData.getEmail());
            
            // Update phone number if this is a phone change
            if (changeType.equals("phone") || changeType.equals("both")) {
                if (verificationData.getNewPhoneNumber() != null) {
                    user.setPhoneNumber(verificationData.getNewPhoneNumber());
                    log.info("Phone number updated for user: {} to {}", user.getEmail(), verificationData.getNewPhoneNumber());
                }
            }
            
            // Update password if this is a password change
            if (changeType.equals("password") || changeType.equals("both")) {
                if (updateData.getNewPassword() != null && !updateData.getNewPassword().isEmpty()) {
                    if (updateData.getCurrentPassword() == null || updateData.getCurrentPassword().isEmpty()) {
                        throw new IllegalArgumentException("Current password is required for password change");
                    }
                    
                    if (!passwordEncoder.matches(updateData.getCurrentPassword(), user.getPassword())) {
                        throw new IllegalArgumentException("Current password is invalid");
                    }
                    
                    if (!updateData.getNewPassword().equals(updateData.getConfirmPassword())) {
                        throw new IllegalArgumentException("New password and confirm password do not match");
                    }
                    
                    user.setPassword(passwordEncoder.encode(updateData.getNewPassword()));
                    log.info("Password updated for user: {}", user.getEmail());
                }
            }
            
            UserEntity updatedUser = userRepository.save(user);
            
            // Clean up verification data
            pendingProfileChanges.remove(verificationKey);
            
            log.info("Profile updated successfully for user: {} with change type: {}", updatedUser.getEmail(), changeType);
            
            return updatedUser;
            
        } catch (Exception e) {
            log.error("Error updating profile for user {}: {}", user.getEmail(), e.getMessage());
            throw e;
        }
    }

}

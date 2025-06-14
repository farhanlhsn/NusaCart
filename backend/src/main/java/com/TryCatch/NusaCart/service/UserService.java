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
        
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
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

        // Format nomor telepon
        String formattedPhone = phoneNumber.trim();
        if (!formattedPhone.endsWith("@s.whatsapp.net")) {
            formattedPhone = formattedPhone + "@s.whatsapp.net";
        }
        
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
            throw new RuntimeException("No pending registration found for this email.");
        }
        
        if (verificationData.isExpired()) {
            pendingRegistrations.remove(email);
            throw new RuntimeException("Verification code has expired. Please register again.");
        }
        
        if (verificationData.getVerificationCode() != verificationCodeInput) {
            throw new RuntimeException("Invalid verification code.");
        }
        
        // Verifikasi berhasil, simpan user ke database
        UserEntity user = verificationData.getUser();
        user.setVerified(true);
        UserEntity savedUser = userRepository.save(user);
        
        // Hapus data sementara
        pendingRegistrations.remove(email);
        
        log.info("Registration verified successfully for user: {}", user.getEmail());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Registrasi berhasil diverifikasi");
        response.put("status", "success");
        response.put("userId", savedUser.getUserId().toString());
        return response;
    }
    
    public Map<String, String> resendRegistrationOTP(String email) {
        RegistrationVerificationData verificationData = pendingRegistrations.get(email);
        
        if (verificationData == null) {
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
            return response;
            
        } catch (Exception e) {
            log.error("Error resending registration verification code: " + e.getMessage());
            throw new RuntimeException("Error sending verification code: " + e.getMessage());
        }
    }
    
    public Map<String, String> updatePhoneRegistration(String email, String newPhoneNumber) {
        RegistrationVerificationData verificationData = pendingRegistrations.get(email);
        
        if (verificationData == null) {
            throw new RuntimeException("No pending registration found for this email.");
        }
        
        // Generate new verification code
        Random random = new Random();
        int newVerificationCode = random.nextInt(9000) + 1000;
        
        // Update user data with new phone number
        UserEntity user = verificationData.getUser();
        user.setPhoneNumber(newPhoneNumber);
        
        // Update verification data
        RegistrationVerificationData newVerificationData = new RegistrationVerificationData(user, newVerificationCode);
        pendingRegistrations.put(email, newVerificationData);
        
        // Kirim verification code ke nomor baru
        try {
            ResponseEntity<String> whatsappResponse = sendWhatsappMessage(newPhoneNumber, 
                "Nomor telepon Anda telah diperbarui untuk registrasi NusaCart. Kode verifikasi baru: *" + newVerificationCode + 
                "*. Masukkan kode ini untuk menyelesaikan pendaftaran.");
            
            if (!whatsappResponse.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to send verification code to new phone number");
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Nomor telepon berhasil diperbarui. Kode verifikasi baru telah dikirim ke nomor WhatsApp yang baru.");
            response.put("status", "phone_updated");
            return response;
            
        } catch (Exception e) {
            log.error("Error updating phone number for registration: " + e.getMessage());
            throw new RuntimeException("Error updating phone number: " + e.getMessage());
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

}

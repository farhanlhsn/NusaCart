package com.TryCatch.NusaCart.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpEntity;     
import org.springframework.http.HttpHeaders;    
import org.springframework.http.HttpMethod;     
import org.springframework.http.MediaType;      
import org.springframework.http.ResponseEntity; 
import org.springframework.web.client.RestTemplate; 
import com.TryCatch.NusaCart.dto.ChangePasswordDTO;
import com.TryCatch.NusaCart.dto.ForgetPasswordDTO;
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
    
    // Inner class untuk menyimpan data verifikasi sementara
    private static class VerificationData {
        private final String newPassword;
        private final int verificationCode;
        private final long timestamp;
        private final String userId; // Tambahkan userId untuk forget password scenarios
        
        // Constructor untuk change password (user sudah login)
        public VerificationData(String newPassword, int verificationCode) {
            this.newPassword = newPassword;
            this.verificationCode = verificationCode;
            this.timestamp = System.currentTimeMillis();
            this.userId = null; // Tidak perlu userId karena user sudah login
        }
        
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
    public Map<String, String> changePassword(ChangePasswordDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User not authenticated");
        }

        UserEntity user = getCurrentUser();
        log.info("Initiating password change for user: {}", user.getEmail());
        
        // Validasi old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid old password"); 
        }

        // Generate verification code
        Random random = new Random();
        int verificationCode = random.nextInt(9000) + 1000;
        
        // Simpan data sementara
        String userId = String.valueOf(user.getUserId());
        VerificationData verificationData = new VerificationData(request.getNewPassword(), verificationCode);
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
    public Map<String, String> confirmPasswordChange(Integer verificationCodeInput) {
        UserEntity user = getCurrentUser();
        String userId = String.valueOf(user.getUserId());
        
        // Ambil data verifikasi
        VerificationData verificationData = pendingPasswordChanges.get(userId);
        
        if (verificationData == null) {
            throw new RuntimeException("No pending password change found. Please start the process again.");
        }
        
        if (verificationData.isExpired()) {
            pendingPasswordChanges.remove(userId);
            throw new RuntimeException("Verification code has expired. Please start the process again.");
        }
        
        // Validasi verification code
        Integer inputCode = verificationCodeInput;
        
        if (inputCode != verificationData.getVerificationCode()) {
            throw new RuntimeException("Invalid verification code");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(verificationData.getNewPassword()));
        userRepository.save(user);
        
        // Hapus data sementara
        pendingPasswordChanges.remove(userId);
        
        log.info("Password changed successfully for user: {}", user.getEmail());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password berhasil diubah");
        response.put("status", "success");
        return response;
    }

    @Value("${app.upload.dir:./uploads/profiles}") 
    private String uploadDir;
    public Map<String, String> updateProfileImage(MultipartFile imageFile) {
        UserEntity user = getCurrentUser();

        //buat folder uploads jika belum ada
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            try {
                Files.createDirectories(uploadPath);
            } catch (IOException e) {
                log.error("Tidak dapat membuat direktori uploads: " + e.getMessage());
            }
        }

        //hapus file lama jika ada
        if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
            try {
                Path oldFilePath = uploadPath.resolve(user.getProfilePicture());
                Files.deleteIfExists(oldFilePath);
            } catch (IOException e) {
                log.error("Tidak dapat menghapus file lama: " + e.getMessage());
            }
        }
        
        String originalFileName = imageFile.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        
        String newFileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(newFileName);
        try {
            Files.copy(imageFile.getInputStream(), filePath);
        } catch (IOException e) {
            log.error("Tidak dapat menyimpan file: " + e.getMessage());
        }
        
        String imageUrl = "/uploads/profiles/" + newFileName; 
        
        user.setProfilePicture(imageUrl);
        userRepository.save(user);
        log.info("Profile image updated successfully");

        Map<String, String> response = new HashMap<>();
        response.put("message", "Profile image berhasil diupdate");
        response.put("status", "success");
        response.put("imageUrl", imageUrl); // Tambahkan URL gambar ke respons
        return response;
    }

    public ResponseEntity<String> sendWhatsappMessage(String phoneNumber, String message) {
        log.info("Sending Whatsapp message to phone number: {}", phoneNumber);

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("phone", phoneNumber + "@s.whatsapp.net");
        requestBody.put("message", message);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(whatsappApiUsername, whatsappApiPassword);

        HttpEntity<Object> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> apiResponse = restTemplate.exchange(
            whatsappApiUrl, HttpMethod.POST, requestEntity, String.class);

        if (apiResponse.getStatusCode().is2xxSuccessful()) {
            log.info("Whatsapp message sent successfully");
        } else {
            log.error("Failed to send Whatsapp message, status: {}", apiResponse.getStatusCode());
            throw new RuntimeException("Failed to send Whatsapp message");
        }
        return apiResponse;
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
    

}

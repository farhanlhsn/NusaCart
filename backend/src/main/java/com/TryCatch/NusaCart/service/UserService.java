package com.TryCatch.NusaCart.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.context.SecurityContextHolder;

import com.TryCatch.NusaCart.dto.ChangePasswordDTO;
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

        UserEntity user = (UserEntity) authentication.getPrincipal();
        
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid old password"); 
        }

        log.info("Getting fresh data for user: {} with roles: {}", user.getEmail(), user.getRoles());
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully");
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password berhasil ditukar");
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

}

package com.TryCatch.NusaCart.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;

import com.TryCatch.NusaCart.dto.ChangePasswordDTO;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.repository.UserRepository;
/* import com.TryCatch.NusaCart.enums.UserRole; */

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

}

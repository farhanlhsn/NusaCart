package com.TryCatch.NusaCart.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TryCatch.NusaCart.dto.UserBasicDTO;
import com.TryCatch.NusaCart.dto.UserUpdateDTO;
import com.TryCatch.NusaCart.dto.ProfileOTPRequestDTO;
import com.TryCatch.NusaCart.dto.ProfileOTPVerifyDTO;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.service.UserService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/user")
@Slf4j
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserBasicDTO> getUserProfile() {
        log.info("Fetching user profile");
        UserEntity user = userService.getCurrentUser();
        UserBasicDTO userDetail = new UserBasicDTO(user);
        return ResponseEntity.ok(userDetail);
    }

    @PutMapping("/update_profile")
    public ResponseEntity<UserBasicDTO> updateUserProfile(@Valid @RequestBody UserUpdateDTO request) {
        log.info("Updating user profile");
        try {
            UserEntity updatedUser = userService.updateUserProfile(request);
            UserBasicDTO userDetail = new UserBasicDTO(updatedUser);
            return ResponseEntity.ok(userDetail);
        } catch (IllegalArgumentException e) {
            log.error("Profile update failed: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/request-profile-otp")
    public ResponseEntity<String> requestProfileOTP(@Valid @RequestBody ProfileOTPRequestDTO request) {
        log.info("Requesting profile OTP for change type: {}", request.getChangeType());
        try {
            userService.requestProfileOTP(request);
            return ResponseEntity.ok("OTP sent successfully");
        } catch (Exception e) {
            log.error("Failed to send profile OTP: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/verify-profile-otp")
    public ResponseEntity<UserBasicDTO> verifyProfileOTP(@Valid @RequestBody ProfileOTPVerifyDTO request) {
        log.info("Verifying profile OTP for change type: {}", request.getChangeType());
        try {
            UserEntity updatedUser = userService.verifyProfileOTP(request);
            UserBasicDTO userDetail = new UserBasicDTO(updatedUser);
            return ResponseEntity.ok(userDetail);
        } catch (Exception e) {
            log.error("Profile OTP verification failed: {}", e.getMessage());
            throw e;
        }
    }
}

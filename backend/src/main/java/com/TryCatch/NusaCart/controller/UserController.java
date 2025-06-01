package com.TryCatch.NusaCart.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.TryCatch.NusaCart.dto.ChangePasswordDTO;
import com.TryCatch.NusaCart.dto.UserDetailDTO;
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
    public ResponseEntity<UserDetailDTO> getUserProfile() {
        log.info("Fetching user profile");
        UserEntity user = userService.getCurrentUser();
        UserDetailDTO userDetail = new UserDetailDTO(user);
        return ResponseEntity.ok(userDetail);
    }

    /* @PutMapping("/update_profile")
    public ResponseEntity<UserDetailDTO> updateUserProfile(@Valid @RequestBody UserDetailDTO request) {
        log.info("Updating user profile");
        UserEntity user = userService.getCurrentUser();
        UserEntity updatedUser = userService.(user, request);
        UserDetailDTO userDetail = new UserDetailDTO(updatedUser);
        return ResponseEntity.ok(userDetail);
    } */

    @PutMapping("/change_password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordDTO request) {
        log.info("Step 1: Initiating password change process");
        try {
            Map<String, String> response = userService.changePassword(request);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to initiate password change: {}", e.getMessage());
            return new ResponseEntity<>(
                Map.of("status", "error","message", e.getMessage()), 
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @PostMapping(
        path = "/confirm_password_change",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> confirmPasswordChange(@RequestBody Map<String, Integer> request) {
        log.info("Step 2: Confirming password change with verification code");
        try {
            Map<String, String> response = userService.confirmPasswordChange(request.get("verificationCode"));
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to confirm password change: {}", e.getMessage());
            return new ResponseEntity<>(
                Map.of("status", "error","message", e.getMessage()), 
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @PostMapping("/change_Profile_Picture")
    public ResponseEntity<Map<String, String>> updateProfilePicture(@Valid @RequestParam("file") MultipartFile file) {
        log.info("Updating user profile");
        Map<String, String> response = userService.updateProfileImage(file);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}

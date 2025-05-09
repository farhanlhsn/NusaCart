package com.TryCatch.NusaCart.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @PutMapping("/change_password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordDTO request) {
        log.info("Changing user password");
        Map<String, String> response = userService.changePassword(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}

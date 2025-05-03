package com.TryCatch.NusaCart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TryCatch.NusaCart.dto.UserDetailDTO;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.service.UserService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/user")
@Slf4j
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/profile")
    public ResponseEntity<UserDetailDTO> getUserProfile() {
        log.info("Fetching user profile");
        UserEntity user = userService.getCurrentUser();
        UserDetailDTO userDetail = new UserDetailDTO(user);
        return ResponseEntity.ok(userDetail);
    }

}

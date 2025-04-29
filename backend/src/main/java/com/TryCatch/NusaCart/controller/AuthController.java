package com.TryCatch.NusaCart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TryCatch.NusaCart.dto.AuthResponseDTO;
import com.TryCatch.NusaCart.dto.LogoutRequestDTO;
import com.TryCatch.NusaCart.dto.UserLoginDTO;
import com.TryCatch.NusaCart.dto.UserRegisterDTO;
import com.TryCatch.NusaCart.service.AuthService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    
    // Constructor Injection
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody UserLoginDTO loginDto) {
        log.info("Login attempt for email: {}", loginDto.getEmail());
        AuthResponseDTO response = authService.login(loginDto);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody UserRegisterDTO registerDto) {
        log.info("Registration attempt for email: {}", registerDto.getEmail());
        AuthResponseDTO response = authService.register(registerDto);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<AuthResponseDTO> logout(@RequestBody LogoutRequestDTO logoutDto) {
        log.info("Logout attempt for email: {}", logoutDto.getEmail());
        AuthResponseDTO response = authService.logout(logoutDto);
        return ResponseEntity.ok(response);
    }
}
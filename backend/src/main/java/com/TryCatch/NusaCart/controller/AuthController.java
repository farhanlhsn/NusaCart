package com.TryCatch.NusaCart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TryCatch.NusaCart.dto.AuthResponseDTO;
import com.TryCatch.NusaCart.dto.UserLoginDTO;
import com.TryCatch.NusaCart.dto.UserRegisterDTO;
import com.TryCatch.NusaCart.service.AuthService;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

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

    @PostMapping(
        path = "/login",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody UserLoginDTO loginDto) {
        log.info("Login attempt for email: {}", loginDto.getEmail());
        AuthResponseDTO response = authService.login(loginDto);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PostMapping(
        path = "/register",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody UserRegisterDTO registerDto) {
        log.info("Registration attempt for email: {}", registerDto.getEmail());
        AuthResponseDTO response = authService.register(registerDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @PostMapping(
        path = "/logout"
    )
    public ResponseEntity<Map<String, String>> logout() {
        //log.info("Logout attempt for email: {}", logoutDto.getEmail());
        Map<String, String> response = authService.logout();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
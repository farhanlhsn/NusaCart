package com.TryCatch.NusaCart.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TryCatch.NusaCart.dto.SellerRegisterDTO;
import com.TryCatch.NusaCart.service.AuthService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/seller")
@Slf4j
public class SellerController {

    @Autowired
    private AuthService authService;
    
    public SellerController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerSeller(@Valid @RequestBody SellerRegisterDTO sellerRegisterDTO) {
        log.info("POST request to register a new seller");
        Map<String, String> response = authService.registerSeller(sellerRegisterDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}

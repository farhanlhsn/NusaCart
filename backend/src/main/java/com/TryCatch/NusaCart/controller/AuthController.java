package com.TryCatch.NusaCart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TryCatch.NusaCart.dto.AuthResponseDTO;
import com.TryCatch.NusaCart.dto.ForgetPasswordDTO;
import com.TryCatch.NusaCart.dto.UserLoginDTO;
import com.TryCatch.NusaCart.dto.UserRegisterDTO;
import com.TryCatch.NusaCart.service.AuthService;
import com.TryCatch.NusaCart.service.UserService;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    private final UserService userService;
    
    // Constructor Injection
    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping(
        path = "/login",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<AuthResponseDTO> login(
            @Valid @RequestBody UserLoginDTO loginDto, 
            HttpServletResponse response) {
        log.info("Login attempt for email: {}", loginDto.getEmail());
        
        AuthResponseDTO authResponse = authService.login(loginDto);
        
        // Set secure cookies untuk tokens
        setTokenCookies(response, authResponse.getAccess_token(), authResponse.getRefresh_token());
        
        // Buat response baru tanpa token di body
        AuthResponseDTO cookieResponse = new AuthResponseDTO(
            authResponse.getUser(), 
            authResponse.getMessage(), 
            authResponse.getExpires_in()
        );
        
        return new ResponseEntity<>(cookieResponse, HttpStatus.OK);
    }
    
    @PostMapping(
        path = "/register",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody UserRegisterDTO registerDto) {
        log.info("Registration attempt for email: {}", registerDto.getEmail());
        Map<String, String> response = authService.register(registerDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @PostMapping(
        path = "/verify-registration",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> verifyRegistration(@RequestBody Map<String, Object> request) {
        log.info("Registration verification attempt for email: {}", request.get("email"));
        
        String email = (String) request.get("email");
        Integer verificationCode = (Integer) request.get("verificationCode");
        
        if (email == null || verificationCode == null) {
            throw new RuntimeException("Email and verification code are required");
        }
        
        Map<String, String> response = authService.verifyRegistration(email, verificationCode);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PostMapping(
        path = "/resend-registration-otp",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> resendRegistrationOTP(@RequestBody Map<String, String> request) {
        log.info("Resend registration OTP for email: {}", request.get("email"));
        
        String email = request.get("email");
        if (email == null) {
            throw new RuntimeException("Email is required");
        }
        
        Map<String, String> response = authService.resendRegistrationOTP(email);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PostMapping(
        path = "/update-phone-registration",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> updatePhoneRegistration(@RequestBody Map<String, String> request) {
        log.info("Update phone number for registration email: {}", request.get("email"));
        
        String email = request.get("email");
        String phoneNumber = request.get("phoneNumber");
        
        if (email == null || phoneNumber == null) {
            throw new RuntimeException("Email and phone number are required");
        }
        
        Map<String, String> response = authService.updatePhoneRegistration(email, phoneNumber);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PostMapping(
        path = "/logout",
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        // Set explicit content type
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        Map<String, String> logoutResponse = authService.logout();
        
        // Clear cookies saat logout
        clearTokenCookies(response);
        
        return new ResponseEntity<>(logoutResponse, HttpStatus.OK);
    }
    
    @PostMapping(
        path = "/refresh",
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> refreshToken(
            HttpServletRequest request, 
            HttpServletResponse response) {
        log.info("Token refresh request received");
        
        // Set explicit content type
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        // Ambil refresh token dari cookie (bukan dari JSON body!)
        String refreshToken = getTokenFromCookie(request, "refresh_token");
        
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new RuntimeException("Refresh token tidak ditemukan dalam cookies");
        }
        
        AuthResponseDTO authResponse = authService.refreshToken(refreshToken);
        
        // Set cookies baru
        setTokenCookies(response, authResponse.getAccess_token(), authResponse.getRefresh_token());
        
        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("status", "success");
        responseMap.put("message", "Token refreshed successfully");
        return new ResponseEntity<>(responseMap, HttpStatus.OK);
    }
    
    /**
     * Method untuk set secure cookies
     */
    private void setTokenCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        // Access Token Cookie (15 menit)
        Cookie accessCookie = new Cookie("access_token", accessToken);
        accessCookie.setHttpOnly(true);           // Tidak bisa diakses JavaScript
        accessCookie.setSecure(false);            // Set true untuk HTTPS production
        accessCookie.setPath("/");                // Available untuk semua path
        accessCookie.setMaxAge(15 * 60);          // 15 menit
        accessCookie.setAttribute("SameSite", "Strict"); // CSRF protection
        response.addCookie(accessCookie);
        
        // Refresh Token Cookie (7 hari)
        Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
        refreshCookie.setHttpOnly(true);          // Tidak bisa diakses JavaScript
        refreshCookie.setSecure(false);           // Set true untuk HTTPS production
        refreshCookie.setPath("/");               // Available untuk semua path
        refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 hari
        refreshCookie.setAttribute("SameSite", "Strict"); // CSRF protection
        response.addCookie(refreshCookie);
        
        log.info("Secure cookies set for tokens");
    }
    
    /**
     * Method untuk clear cookies saat logout
     */
    private void clearTokenCookies(HttpServletResponse response) {
        // Clear access token cookie
        Cookie accessCookie = new Cookie("access_token", "");
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0); // Expire immediately
        response.addCookie(accessCookie);
        
        // Clear refresh token cookie
        Cookie refreshCookie = new Cookie("refresh_token", "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0); // Expire immediately
        response.addCookie(refreshCookie);
        
        log.info("Token cookies cleared");
    }
    
    /**
     * Method untuk ambil token dari cookie
     */
    private String getTokenFromCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    @PostMapping("/forget_password")
    public ResponseEntity<Map<String, String>> forgetPassword(@Valid @RequestBody ForgetPasswordDTO request) {
        log.info("Step 1: Initiating forget password process");
        try {
            Map<String, String> response = userService.forgetPassword(request);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to initiate forget password: {}", e.getMessage());
            return new ResponseEntity<>(
                Map.of("status", "error", "message", e.getMessage()), 
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @PostMapping("/confirm_forget_password")
    public ResponseEntity<Map<String, String>> confirmForgetPassword(@RequestBody Map<String, Integer> request) {
        log.info("Step 2: Confirming forget password with verification code");
        try {
            Integer verificationCode = request.get("verificationCode");
            if (verificationCode == null) {
                throw new RuntimeException("Verification code is required");
            }
            
            Map<String, String> response = userService.confirmForgetPassword(verificationCode);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to confirm forget password: {}", e.getMessage());
            return new ResponseEntity<>(
                Map.of("status", "error", "message", e.getMessage()), 
                HttpStatus.BAD_REQUEST
            );
        }
    }
}

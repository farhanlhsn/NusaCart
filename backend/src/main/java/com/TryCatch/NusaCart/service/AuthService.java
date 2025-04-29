package com.TryCatch.NusaCart.service;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.TryCatch.NusaCart.dto.AuthResponseDTO;
import com.TryCatch.NusaCart.dto.UserLoginDTO;
import com.TryCatch.NusaCart.dto.UserRegisterDTO;
import com.TryCatch.NusaCart.dto.UserResponseDTO;
import com.TryCatch.NusaCart.entity.User;
import com.TryCatch.NusaCart.enums.UserRole;
import com.TryCatch.NusaCart.repository.UserRepository;
import com.TryCatch.NusaCart.security.JwtUtil;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthService {
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder, 
                      JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponseDTO login(UserLoginDTO request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        user.setLogin(true);
        user.setLastLogin(LocalDateTime.now());
        User CurrentUser = userRepository.save(user);

        String token = jwtUtil.generateToken(CurrentUser);
        return new AuthResponseDTO(token, new UserResponseDTO(CurrentUser), "Login berhasil");
    }

    @Transactional
    public AuthResponseDTO logout(String email) {
        log.info("Logout attempt for email: {}", email);
        
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        user.setLogin(false);
        
        User CurrentUser = userRepository.save(user);
        return new AuthResponseDTO(new UserResponseDTO(CurrentUser), "Logout berhasil");
    }

    @Transactional
    public AuthResponseDTO register(UserRegisterDTO request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);
        user.setRegisteredDate(LocalDateTime.now());
        user.setProfilePicture("");
        User savedUser = userRepository.save(user);
        
        return new AuthResponseDTO(new UserResponseDTO(savedUser), "Registrasi berhasil");
    }
}

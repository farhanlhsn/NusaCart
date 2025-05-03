package com.TryCatch.NusaCart.service;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.TryCatch.NusaCart.dto.AuthResponseDTO;
import com.TryCatch.NusaCart.dto.LogoutRequestDTO;
import com.TryCatch.NusaCart.dto.UserLoginDTO;
import com.TryCatch.NusaCart.dto.UserRegisterDTO;
import com.TryCatch.NusaCart.dto.UserBasicDTO;
import com.TryCatch.NusaCart.entity.UserEntity;
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
        
        UserEntity user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        user.setLogin(true);
        user.setLastLogin(LocalDateTime.now());
        UserEntity currentUser = userRepository.save(user);

        String token = jwtUtil.generateToken(currentUser);
        return new AuthResponseDTO(token, new UserBasicDTO(currentUser), "Login berhasil");
    }

    @Transactional
    public AuthResponseDTO logout(LogoutRequestDTO request) {
        log.info("Logout attempt for email: {}", request.getEmail());
        
        UserEntity user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));
        user.setLogin(false);
        
        UserEntity currentUser = userRepository.save(user);
        return new AuthResponseDTO(new UserBasicDTO(currentUser), "Logout berhasil");
    }

    @Transactional
    public AuthResponseDTO register(UserRegisterDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email sudah terdaftar");
        }

        UserEntity user = new UserEntity();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);
        user.setRegisteredDate(LocalDateTime.now());
        user.setProfilePicture("");
        UserEntity savedUser = userRepository.save(user);
        
        return new AuthResponseDTO(new UserBasicDTO(savedUser), "Registrasi berhasil");
    }
}

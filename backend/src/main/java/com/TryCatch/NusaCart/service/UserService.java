package com.TryCatch.NusaCart.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.TryCatch.NusaCart.dto.UserRegisterDTO;
import com.TryCatch.NusaCart.dto.UserResponseDTO;
import com.TryCatch.NusaCart.entity.User;
import com.TryCatch.NusaCart.enums.UserRole;
import com.TryCatch.NusaCart.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;


@Service
@Slf4j
public class UserService {
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponseDTO register(UserRegisterDTO request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);
        user.setRegisteredDate(LocalDateTime.now());
        user.setProfilePicture("");
        User savedUser = userRepository.save(user);
        
        return new UserResponseDTO(savedUser);
    }

    /* @Transactional
    public UserResponseDTO(UserLoginDTO request) {} */
}

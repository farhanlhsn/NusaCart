package com.TryCatch.NusaCart.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.TryCatch.NusaCart.repository.UserRepository;

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

}

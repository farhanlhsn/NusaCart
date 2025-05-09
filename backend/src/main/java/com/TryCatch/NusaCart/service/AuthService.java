package com.TryCatch.NusaCart.service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.TryCatch.NusaCart.dto.AuthResponseDTO;
import com.TryCatch.NusaCart.dto.SellerRegisterDTO;
import com.TryCatch.NusaCart.dto.TokoDTO;
import com.TryCatch.NusaCart.dto.UserLoginDTO;
import com.TryCatch.NusaCart.dto.UserRegisterDTO;
import com.TryCatch.NusaCart.dto.UserBasicDTO;
import com.TryCatch.NusaCart.entity.TokoEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.enums.UserRole;
import com.TryCatch.NusaCart.repository.TokoRepository;
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
    
    @Autowired
    private TokoRepository tokoRepository;

    public AuthService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder, 
                      JwtUtil jwtUtil,
                      TokoRepository tokoRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.tokoRepository = tokoRepository;
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
    public Map<String, String> logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            log.error("Logout gagal: user tidak terautentikasi");
            throw new RuntimeException("User sedang tidak login");
        }
        
        UserEntity user = (UserEntity) authentication.getPrincipal();
        String email = user.getEmail();
        log.info("Logout attempt for email: {}", email);
        
        UserEntity currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        currentUser.setLogin(false);
        userRepository.save(currentUser);
        log.info("User {} logged out successfully", email);
        
        SecurityContextHolder.clearContext();
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout berhasil");
        response.put("status", "success");
        return response;
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
        user.addRole(UserRole.USER);
        user.setRegisteredDate(LocalDateTime.now());
        user.setProfilePicture("");
        user.setPhoneNumber(request.getPhoneNumber());
        UserEntity savedUser = userRepository.save(user);
        
        return new AuthResponseDTO(new UserBasicDTO(savedUser), "Registrasi berhasil");
    }

    @Transactional
    public Map<String, String> registerSeller(SellerRegisterDTO request) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            log.error("Registrasi seller gagal: user tidak terautentikasi");
            throw new RuntimeException("User harus login terlebih dahulu");
        }
        
        UserEntity user = (UserEntity) authentication.getPrincipal();
        log.info("Registering seller for user: {}", user.getEmail());
        
        // Check if email toko already exists
        if (tokoRepository.existsByEmailToko(request.getEmailToko())) {
            throw new IllegalArgumentException("Email toko sudah digunakan");
        }
        
        // Check if nama toko already exists
        if (tokoRepository.existsByNamaToko(request.getNamaToko())) {
            throw new IllegalArgumentException("Nama toko sudah digunakan");
        }
        
        // Add SELLER role to user if they don't have it yet
        if (!user.getRoles().contains(UserRole.SELLER)) {
            user.addRole(UserRole.SELLER);
            userRepository.save(user);
            log.info("Added SELLER role to user: {}", user.getEmail());
        }
        
        // Create and save the store entity
        TokoEntity toko = new TokoEntity();
        toko.setNamaToko(request.getNamaToko());
        toko.setDeskripsiToko(request.getDescriptionToko());
        toko.setAlamatToko(request.getAlamatToko());
        toko.setSeller(user);
        toko.setNoTelpToko(request.getNoTelpToko());
        toko.setEmailToko(request.getEmailToko());
        toko.setProfilePictureToko(request.getProfilePictureTokoURL());
        
        TokoEntity savedToko = tokoRepository.save(toko);
        log.info("Store registered with ID: {}", savedToko.getIdToko());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Pendaftaran toko " + savedToko.getNamaToko() + " berhasil");
        response.put("status", "success");
        return response;
    }
}

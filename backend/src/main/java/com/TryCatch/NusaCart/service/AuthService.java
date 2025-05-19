package com.TryCatch.NusaCart.service;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.TryCatch.NusaCart.dto.AuthResponseDTO;
import com.TryCatch.NusaCart.dto.SellerRegisterDTO;
/* import com.TryCatch.NusaCart.dto.TokoDTO; */
import com.TryCatch.NusaCart.dto.UserLoginDTO;
import com.TryCatch.NusaCart.dto.UserRegisterDTO;
import com.TryCatch.NusaCart.dto.UserBasicDTO;
import com.TryCatch.NusaCart.entity.RefreshTokenEntity;
import com.TryCatch.NusaCart.entity.TokoEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.enums.UserRole;
import com.TryCatch.NusaCart.repository.RefreshTokenRepository;
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

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    public AuthService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder, 
                      JwtUtil jwtUtil,
                      TokoRepository tokoRepository, 
                      RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.tokoRepository = tokoRepository;
        this.refreshTokenRepository = refreshTokenRepository;
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

        // Delete any existing refresh token for this user
        refreshTokenRepository.deleteByUser(currentUser);

        // Generate access token
        String access_token = jwtUtil.generateToken(currentUser);
        
        // Generate refresh token
        String refresh_token = jwtUtil.generateRefreshToken(currentUser);
        
        // Get token expiration time
        Date expDate = new Date(System.currentTimeMillis() + jwtUtil.getExpirationTime());
        LocalDateTime expires_in = LocalDateTime.ofInstant(expDate.toInstant(), ZoneId.systemDefault());

        // Create response with both tokens using the new constructor
        AuthResponseDTO response = new AuthResponseDTO(access_token, refresh_token, expires_in, new UserBasicDTO(currentUser), "Login berhasil");
        
        log.info("User {} berhasil login", user.getEmail());
        
        return response;
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

        // Delete any existing refresh token for this user
        refreshTokenRepository.deleteByUser(currentUser);
        
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

    @Transactional
    public AuthResponseDTO refreshToken(String refreshToken) {
        log.info("Processing refresh token request");
        
        // Validate refresh token
        if (!jwtUtil.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }
        
        try {
            // Get user from refresh token
            Optional<RefreshTokenEntity> tokenEntity = refreshTokenRepository.findByToken(refreshToken);
            if (!tokenEntity.isPresent()) {
                throw new RuntimeException("Refresh token tidak valid");
            }
            
            UserEntity user = tokenEntity.get().getUser();
            if (user == null) {
                throw new RuntimeException("User tidak ditemukan");
            }
            
            // Generate new access token
            String newAccessToken = jwtUtil.generateToken(user);
            
            // Calculate expiration
            Date expDate = new Date(System.currentTimeMillis() + jwtUtil.getExpirationTime());
            LocalDateTime expiresIn = LocalDateTime.ofInstant(expDate.toInstant(), ZoneId.systemDefault());
            
            log.info("Access token refreshed for user: {}", user.getEmail());
            
            // Return response with new access token and same refresh token
            return new AuthResponseDTO(newAccessToken, refreshToken, expiresIn, new UserBasicDTO(user), "Token berhasil diperbaharui");
            
        } catch (Exception e) {
            log.error("Error refreshing token: {}", e.getMessage());
            throw new RuntimeException("Error saat memperbaharui token: " + e.getMessage());
        }
    }
}

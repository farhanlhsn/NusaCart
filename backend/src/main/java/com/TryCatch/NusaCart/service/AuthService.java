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
import com.TryCatch.NusaCart.dto.UserLoginDTO;
import com.TryCatch.NusaCart.dto.UserRegisterDTO;
import com.TryCatch.NusaCart.dto.UserBasicDTO;
/* import com.TryCatch.NusaCart.dto.SellerRegisterDTO; */
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

/*     //to be continued
    @Transactional
    public Map<String, String> registerSeller(SellerRegisterDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email sudah terdaftar");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserEntity user = (UserEntity) authentication.getPrincipal();
        user.addRole(UserRole.SELLER);
        userRepository.save(user);

        TokoEntity toko = new TokoEntity();
        toko.setEmail(request.getEmailToko());
        toko.setName(request.getNamaToko());
        toko.setRegisteredDate(LocalDateTime.now());
        toko.setProfilePicture(request.getProfilePictureTokoURL());
        toko.setPhoneNumber(request.getNoTelpToko());
        toko.setDescription(request.getDescriptionToko());
        toko.setAddress(request.getAlamatToko());

        Map<String, String> response = new HashMap<>();
        response.put("message", ("Pendaftaran toko " + toko.getName() + " berhasil"));
        response.put("status", "success");
        TokoEntity savedToko = tokoRepository.save(toko);
        return new HashMap<>();
    } */
}

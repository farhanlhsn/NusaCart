package com.TryCatch.NusaCart.security;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.TryCatch.NusaCart.config.JwtConfig;
import com.TryCatch.NusaCart.entity.RefreshTokenEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.repository.RefreshTokenRepository;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;

import org.springframework.util.StringUtils;

@Component
@Slf4j
public class JwtUtil {
    private final SecretKey key;
    private final long expirationTime;
    
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    
    @Autowired
    public JwtUtil(JwtConfig jwtConfig, 
    SecretKey secretKey, 
    RefreshTokenRepository refreshTokenRepository) 
    {
        this.key = secretKey;
        this.expirationTime = jwtConfig.getJwtExpiration();
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public String generateToken(UserEntity user) {
        String email = user.getEmail();
        Integer userId = user.getUserId();
        Date currDate = new Date();
        Date expDate = new Date(System.currentTimeMillis() + expirationTime);

        String token = Jwts.builder()
                        .setSubject(email)
                        .claim("userId", userId)
                        .setIssuedAt(currDate)
                        .setExpiration(expDate)
                        .signWith(key, SignatureAlgorithm.HS512)
                        .compact();

        return token;
    }

    private static final int REFRESH_TOKEN_EXPIRY_DAYS = 7;
    public String generateRefreshToken(UserEntity user) {
        // Waktu sekarang dan expired
        Date issuedAt = new Date();
        Date expiryDate = new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000L);

        // Generate JWT refresh token
        String token = Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getUserId())
                .setIssuedAt(issuedAt)
                .setExpiration(expiryDate)
                .claim("tokenType", "refresh")  // Menandai token sebagai refresh token
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();

        // Konversi Date ke LocalDateTime
        LocalDateTime expiredAt = LocalDateTime.ofInstant(
                expiryDate.toInstant(), ZoneId.systemDefault());
        
        LocalDateTime createdAt = LocalDateTime.ofInstant(
                issuedAt.toInstant(), ZoneId.systemDefault());

        // Simpan refresh token ke database
        RefreshTokenEntity refreshTokenEntity = new RefreshTokenEntity();
        refreshTokenEntity.setToken(token);
        refreshTokenEntity.setUser(user);
        refreshTokenEntity.setCreatedAt(createdAt);
        refreshTokenEntity.setExpiredAt(expiredAt);

        refreshTokenRepository.save(refreshTokenEntity);

        log.info("Refresh token (JWT) generated for user: {}", user.getEmail());

        return token;
    }


    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            throw new AuthenticationCredentialsNotFoundException("JWT expired", e.fillInStackTrace());
        } catch (MalformedJwtException e) {
            throw new AuthenticationCredentialsNotFoundException("Invalid JWT", e.fillInStackTrace());
        } catch (Exception e) {
            throw new AuthenticationCredentialsNotFoundException("JWT error", e.fillInStackTrace());
        }
    }

    public String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && (bearerToken.startsWith("Bearer "))) {
            return bearerToken.substring(7, bearerToken.length());
        }

        return null;
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public Integer getUserIdFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("userId", Integer.class);
    }

    public LocalDateTime getExpireDate(String token) {
        Date expiration = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
        return LocalDateTime.ofInstant(expiration.toInstant(), ZoneId.systemDefault());
    }
    
    public long getExpirationTime() {
        return expirationTime;
    }
    
    public boolean validateRefreshToken(String refreshToken) {
        try {
            // Validasi token format dan signature
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(refreshToken);
            
            // Periksa apakah token ada di database
            Optional<RefreshTokenEntity> tokenEntity = refreshTokenRepository.findByToken(refreshToken);
            if (!tokenEntity.isPresent()) {
                log.warn("Refresh token tidak ditemukan di database");
                return false;
            }
            
            // Periksa apakah token sudah expired
            RefreshTokenEntity storedToken = tokenEntity.get();
            if (storedToken.getExpiredAt().isBefore(LocalDateTime.now())) {
                log.warn("Refresh token sudah kadaluarsa");
                refreshTokenRepository.delete(storedToken);
                return false;
            }
            
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("Refresh token expired: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Error validasi refresh token: {}", e.getMessage());
            return false;
        }
    }
    
    public String generateNewAccessTokenFromRefreshToken(String refreshToken) {
        if (!validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        
        try {
            // Cari user
            Optional<UserEntity> userOpt = refreshTokenRepository.findByToken(refreshToken)
                .map(RefreshTokenEntity::getUser);
            
            if (!userOpt.isPresent()) {
                throw new RuntimeException("User tidak ditemukan");
            }
            
            // Generate token baru
            return generateToken(userOpt.get());
            
        } catch (Exception e) {
            log.error("Error saat generate access token baru: {}", e.getMessage());
            throw new RuntimeException("Tidak dapat generate access token baru", e);
        }
    }
}

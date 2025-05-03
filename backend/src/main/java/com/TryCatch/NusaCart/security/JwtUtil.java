package com.TryCatch.NusaCart.security;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.TryCatch.NusaCart.config.JwtConfig;
import com.TryCatch.NusaCart.entity.UserEntity;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import java.util.Date;
import org.springframework.util.StringUtils;

@Component
public class JwtUtil {
    private final SecretKey key;
    private final long expirationTime;
    
    @Autowired
    public JwtUtil(JwtConfig jwtConfig, SecretKey secretKey) {
        this.key = secretKey;
        this.expirationTime = jwtConfig.getJwtExpiration();
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
}

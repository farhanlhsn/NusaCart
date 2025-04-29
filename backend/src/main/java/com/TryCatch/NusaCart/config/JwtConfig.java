package com.TryCatch.NusaCart.config;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;

@Configuration
public class JwtConfig {
    
    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;
    
    @Bean
    public SecretKey secretKey() {
        return Keys.secretKeyFor(SignatureAlgorithm.HS512);
    }
    
    public long getJwtExpiration() {
        return jwtExpiration;
    }
}
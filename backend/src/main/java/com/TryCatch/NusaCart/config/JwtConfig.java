package com.TryCatch.NusaCart.config;

import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

@Configuration
public class JwtConfig {
    
    @Value("${jwt.expiration:180000}") //untuk testing dibuat 3 menit
    private long jwtExpiration;

    private String hardcodedJwtSecretString = "Sinergi Bangun Negeri Maju dalam ilmu pengetahuan Satukan tekad bersama padukan langkah Bawa bangsa menuju garis depan";
    
    @Bean
    public SecretKey secretKey() {
        byte[] keyBytes = hardcodedJwtSecretString.getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(keyBytes, SignatureAlgorithm.HS512.getJcaName());
    }
    
    public long getJwtExpiration() {
        return jwtExpiration;
    }

    public void setJwtExpiration(long jwtExpiration) {
        this.jwtExpiration = jwtExpiration;
    }
}
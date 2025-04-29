package com.TryCatch.NusaCart.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private UserResponseDTO user;
    private String message;
    private LocalDateTime loginTime;
    
    // Constructor untuk respons sukses dengan token
    public AuthResponseDTO(String token, UserResponseDTO user, String message) {
        this.token = token;
        this.user = user;
        this.message = message;
        this.loginTime = user.getLastLogin();
        this.tokenType = "Bearer";
    }
    
    // Constructor untuk respons sukses tanpa token (misalnya untuk logout)
    public AuthResponseDTO(UserResponseDTO user, String message) {
        this.user = user;
        this.message = message;
        this.loginTime = user.getLastLogin();
        this.tokenType = "Bearer";
    }
}

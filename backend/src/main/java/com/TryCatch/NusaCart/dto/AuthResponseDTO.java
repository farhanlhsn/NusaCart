package com.TryCatch.NusaCart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String status = "success";
    private String message;
    private String tokenType = "Bearer";
    private String token;
    private UserBasicDTO user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthDataDTO {
        private UserBasicDTO user;
        private String token;
    }
    
    // Constructor untuk respons sukses dengan token
    public AuthResponseDTO(String token, UserBasicDTO user, String message) {
        this.token = token;
        this.user = user;
        this.message = message;
        this.tokenType = "Bearer ";
        this.status = "success";
    }
    
    // Constructor untuk respons sukses tanpa token (misalnya untuk logout)
    public AuthResponseDTO(UserBasicDTO user, String message) {
        this.user = user;
        this.message = message;
        this.tokenType = "Bearer";
        this.status = "success";
    }
}

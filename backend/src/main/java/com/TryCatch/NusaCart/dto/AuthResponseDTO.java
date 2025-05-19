package com.TryCatch.NusaCart.dto;

import java.time.LocalDateTime;

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
    private String access_token;
    private LocalDateTime expires_in;
    private String refresh_token;
    private UserBasicDTO user;

/*     @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthDataDTO {
        private UserBasicDTO user;
        private String token;
    } */
    
    // Constructor untuk respons sukses dengan token
/*     public AuthResponseDTO(String access_token, UserBasicDTO user, String message) {
        this.access_token = access_token;
        this.user = user;
        this.message = message;
        this.tokenType = "Bearer ";
        this.status = "success";
    } */
    
    // Constructor untuk respons sukses tanpa token (misalnya untuk logout)
    public AuthResponseDTO(UserBasicDTO user, String message) {
        this.user = user;
        this.message = message;
        this.tokenType = "Bearer";
        this.status = "success";
    }
    
    // Constructor untuk respons sukses dengan access token dan refresh token
    public AuthResponseDTO(String access_token, String refresh_token, LocalDateTime expires_in, UserBasicDTO user, String message) {
        this.access_token = access_token;
        this.refresh_token = refresh_token;
        this.expires_in = expires_in;
        this.user = user;
        this.message = message;
        this.tokenType = "Bearer";
        this.status = "success";
    }
}

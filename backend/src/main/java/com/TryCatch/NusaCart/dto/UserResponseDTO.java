package com.TryCatch.NusaCart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.TryCatch.NusaCart.entity.User;
import com.TryCatch.NusaCart.enums.UserRole;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    
    private String userId;        
    private String name;          
    private String email;         
    private UserRole role;        
    private boolean isLogin;     
    private LocalDateTime lastLogin; 
    private String profilePicture;
    private LocalDateTime registeredDate;
    
    // Constructor untuk mengkonversi User Entity ke DTO
    public UserResponseDTO(User user) {
        this.userId = user.getUserId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.isLogin = user.isLogin();
        this.lastLogin = user.getLastLogin();
        this.profilePicture = user.getProfilePicture();
        this.registeredDate = user.getRegisteredDate();
    }
}
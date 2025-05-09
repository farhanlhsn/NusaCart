package com.TryCatch.NusaCart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.enums.UserRole;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBasicDTO {
    
    private Integer userId;        
    private String name;
    private String email;               
    private Set<UserRole> role;             
    private String profilePicture;
    
    // Constructor untuk mengkonversi User Entity ke DTO
    public UserBasicDTO(UserEntity user) {
        this.userId = user.getUserId();
        this.name = user.getName();
        this.role = user.getRoles();
        this.profilePicture = user.getProfilePicture();
        this.email = user.getEmail();
    }
}
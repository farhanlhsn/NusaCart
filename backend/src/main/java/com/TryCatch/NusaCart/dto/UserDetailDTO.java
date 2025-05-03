package com.TryCatch.NusaCart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.TryCatch.NusaCart.entity.UserEntity;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailDTO {
    private boolean isLogin;
    private LocalDateTime lastLogin;
    private LocalDateTime registeredDate;

    public UserDetailDTO(UserEntity user) {
        this.isLogin = user.isLogin();
        this.lastLogin = user.getLastLogin();
        this.registeredDate = user.getRegisteredDate();
    }
}

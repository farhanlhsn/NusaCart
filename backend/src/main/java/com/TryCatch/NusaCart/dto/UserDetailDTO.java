package com.TryCatch.NusaCart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.TryCatch.NusaCart.entity.UserEntity;

@Data
//@Builder
@EqualsAndHashCode(callSuper=false)
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailDTO extends UserBasicDTO {
    private LocalDateTime lastLogin;
    private LocalDateTime registeredDate;

    public UserDetailDTO(UserEntity user) {
        super(user);
        this.lastLogin = user.getLastLogin();
        this.registeredDate = user.getRegisteredDate();
    }
}

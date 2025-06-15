package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileOTPVerifyDTO {
    @NotNull(message = "Verification code is required")
    private Integer verificationCode;
    
    @NotBlank(message = "Change type is required")
    private String changeType; // "phone", "password", or "both"
    
    @NotNull(message = "Update data is required")
    private UserUpdateDTO updateData;
} 
package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileOTPRequestDTO {
    @NotBlank(message = "Change type is required")
    private String changeType; // "phone", "password", or "both"
    
    private String newPhoneNumber; // Only required when changeType is "phone" or "both"
} 
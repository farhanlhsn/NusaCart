package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {
    
    @NotBlank(message = "Nama tidak boleh kosong")
    private String name;
    
    @NotBlank(message = "Email tidak boleh kosong")
    @Email(message = "Format email tidak valid")
    private String email;
    
    private String phoneNumber;
    
    // Optional password fields
    private String currentPassword;
    
    @Size(min = 8, message = "Password minimal 8 karakter")
    private String newPassword;
    
    private String confirmPassword;
} 
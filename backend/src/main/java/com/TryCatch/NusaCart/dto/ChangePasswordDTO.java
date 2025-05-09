package com.TryCatch.NusaCart.dto;

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
public class ChangePasswordDTO {
    @NotBlank(message = "Password tidak boleh kosong")
    @Size(min = 8, message = "Password minimal 8 karakter")
    private String oldPassword;
    
    @NotBlank(message = "Password tidak boleh kosong")
    @Size(min = 8, message = "Password minimal 8 karakter")
    private String newPassword;
}

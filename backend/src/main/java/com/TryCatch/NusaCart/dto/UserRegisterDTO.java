package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRegisterDTO {
    @NotBlank(message = "Nama tidak boleh kosong")
    private String name;

    @NotBlank(message = "Email tidak boleh kosong")
    @Email(message = "Format email tidak valid")
    private String email;

    @NotBlank(message = "Password tidak boleh kosong")
    @Size(min = 8, message = "Password minimal 8 karakter")
    private String password;

    @NotBlank(message = "Nomor telepon tidak boleh kosong")
    @Pattern(
        regexp = "^(\\+?62|0)8[1-9]\\d{7,10}$", 
        message = "Format nomor telepon tidak valid. Gunakan format: 08xxxxxxxxx atau 62xxxxxxxxx"
    )
    private String phoneNumber;
}

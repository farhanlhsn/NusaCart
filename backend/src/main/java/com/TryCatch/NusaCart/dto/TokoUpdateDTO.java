package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokoUpdateDTO {
    private String namaToko;
    private String deskripsiToko;
    private String alamatToko;
    
    @Size(min = 10, max = 13, message = "Nomor telepon harus terdiri dari 10-13 digit")
    @Pattern(regexp = "\\d+", message = "Nomor telepon harus berisi angka")
    private String noTelpToko;
    
    @Email(message = "Format email tidak valid")
    private String emailToko;
    
    private String profilePictureToko;
}

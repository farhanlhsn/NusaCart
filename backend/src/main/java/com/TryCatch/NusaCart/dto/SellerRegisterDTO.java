package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class SellerRegisterDTO {
    @NotBlank(message = "Nama tidak boleh kosong")
    private String namaToko;

    @NotBlank(message = "Alamat tidak boleh kosong")
    private String alamatToko;

    @NotBlank(message = "Nomor telepon tidak boleh kosong")
    @Size(min = 10, max = 13, message = "Nomor telepon harus terdiri dari 10-13 digit")
    @Pattern(regexp = "\\d+", message = "Nomor telepon harus berisi angka")
    private String noTelpToko;

    @NotBlank(message = "Email tidak boleh kosong")
    @Email(message = "Format email tidak valid")
    private String emailToko;

    private String profilePictureTokoURL;

    @NotBlank(message = "Deskripsi tidak boleh kosong")
    private String descriptionToko;

    @Column(name = "registered_date", nullable = false, updatable = false) 
    private LocalDateTime registeredDate;
}

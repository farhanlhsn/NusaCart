package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryUpdateDTO {
    
    @NotBlank(message = "Nama kategori tidak boleh kosong")
    private String namaCategory;
}

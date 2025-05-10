package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCreateDTO {
    
    @NotBlank(message = "Nama kategori tidak boleh kosong")
    private String namaCategory;
    
    @NotNull(message = "ID toko tidak boleh kosong")
    private Integer idToko;
}

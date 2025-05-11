package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.Min;
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
public class ProductCreateDTO {
    
    @NotBlank(message = "Nama produk tidak boleh kosong")
    private String productName;
    
    private String description;
    
    @NotNull(message = "Harga produk tidak boleh kosong")
    @Min(value = 0, message = "Harga produk harus lebih dari 0")
    private Double price;
    
    @NotNull(message = "Stok produk tidak boleh kosong")
    @Min(value = 0, message = "Stok produk tidak boleh negatif")
    private Integer stock;
    
    @NotNull(message = "ID toko tidak boleh kosong")
    private Integer idToko;
    
    private String imageUrl;
    
    private Integer idCategory;
    
    private Boolean isActive = true;
}

package com.TryCatch.NusaCart.dto;

import java.util.List;

import com.TryCatch.NusaCart.enums.GeneralCategory;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateDTO {
    
    private String productName;
    
    private String description;
    
    @Min(value = 0, message = "Harga produk harus lebih dari 0")
    private Double price;
    
    @Min(value = 0, message = "Stok produk tidak boleh negatif")
    private Integer stock;
    
    private List<String> imageUrls;
    
    private Integer idCategory;
    
    private GeneralCategory generalCategory;
    
    private Boolean isActive;
}

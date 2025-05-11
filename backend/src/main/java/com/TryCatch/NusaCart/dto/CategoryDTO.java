package com.TryCatch.NusaCart.dto;

import java.time.LocalDateTime;

import com.TryCatch.NusaCart.entity.CategoryEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Integer idCategory;
    private String namaCategory;
    private Integer idToko;
    private String namaToko;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor to convert entity to DTO
    public CategoryDTO(CategoryEntity category) {
        this.idCategory = category.getIdCategory();
        this.namaCategory = category.getNamaCategory();
        this.idToko = category.getToko().getIdToko();
        this.namaToko = category.getToko().getNamaToko();
        this.createdAt = category.getCreatedAt();
        this.updatedAt = category.getUpdatedAt();
    }
}

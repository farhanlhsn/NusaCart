package com.TryCatch.NusaCart.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.TryCatch.NusaCart.entity.ProductEntity;
import com.TryCatch.NusaCart.enums.GeneralCategory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {
    private Integer productId;
    private String productName;
    private String description;
    private Double price;
    private Integer stock;
    private Integer idToko;
    private String namaToko;
    private List<String> imageUrls;
    private Integer idCategory;
    private String categoryName;
    private GeneralCategory generalCategory;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor to convert entity to DTO
    public ProductResponseDTO(ProductEntity product) {
        this.productId = product.getProductId();
        this.productName = product.getProductName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.stock = product.getStock();
        this.idToko = product.getToko().getIdToko();
        this.namaToko = product.getToko().getNamaToko();
        this.imageUrls = product.getImageUrls();
        
        if (product.getCategory() != null) {
            this.idCategory = product.getCategory().getIdCategory();
            this.categoryName = product.getCategory().getNamaCategory();
        }
        
        this.generalCategory = product.getGeneralCategory();
        this.isActive = product.getIsActive();
        this.createdAt = product.getCreatedAt();
        this.updatedAt = product.getUpdatedAt();
    }
}

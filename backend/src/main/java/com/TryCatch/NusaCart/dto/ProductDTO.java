package com.TryCatch.NusaCart.dto;

import java.time.LocalDateTime;

import com.TryCatch.NusaCart.entity.ProductEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    
    private Integer productId;
    private String productName;
    private String description;
    private Double price;
    private Integer stock;
    private Integer idToko;
    private String tokoName;
    private String imageUrl;
    private Integer idCategory;
    private String categoryName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor from ProductEntity
    public ProductDTO(ProductEntity product) {
        this.productId = product.getProductId();
        this.productName = product.getProductName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.stock = product.getStock();
        this.idToko = product.getToko() != null ? product.getToko().getIdToko() : null;
        this.tokoName = product.getToko() != null ? product.getToko().getNamaToko() : null;
        this.imageUrl = product.getImageUrl();
        this.idCategory = product.getCategory() != null ? product.getCategory().getIdCategory() : null;
        this.categoryName = product.getCategory() != null ? product.getCategory().getNamaCategory() : null;
        this.isActive = product.getIsActive();
        this.createdAt = product.getCreatedAt();
        this.updatedAt = product.getUpdatedAt();
    }
}
package com.TryCatch.NusaCart.dto;

import lombok.Data;

@Data
public class CartResponseDTO {
    private Long id;
    private Integer productId;
    private String productName;
    private Integer quantity;
    private Double price;
    private String imageUrl;
    
    // Store information
    private Integer storeId;
    private String storeName;
    private String storeLocation;
}

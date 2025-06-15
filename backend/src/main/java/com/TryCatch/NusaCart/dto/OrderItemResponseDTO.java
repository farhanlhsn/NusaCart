package com.TryCatch.NusaCart.dto;

import lombok.Data;

@Data
public class OrderItemResponseDTO {
    private Integer productId;
    private String productName;
    private Integer quantity;
    private Double price;
    private Integer storeId;
    private String storeName;
    private String imageUrl; 
}
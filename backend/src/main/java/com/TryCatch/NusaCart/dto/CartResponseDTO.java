package com.TryCatch.NusaCart.dto;


import lombok.Data;

@Data
public class CartResponseDTO {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double price;
}

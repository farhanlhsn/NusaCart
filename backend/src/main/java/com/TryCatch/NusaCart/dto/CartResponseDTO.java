package com.TryCatch.NusaCart.dto;


import lombok.Data;

@Data
public class CartResponseDTO {
    private Long id;
    private Integer productId;
    private String productName;
    private Integer quantity;
    private Double price;
}

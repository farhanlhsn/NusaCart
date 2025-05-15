package com.TryCatch.NusaCart.dto;

import lombok.Data;

@Data
public class CartCreateDTO {
    private Long productId;
    private Integer quantity;
}
package com.TryCatch.NusaCart.dto;

import lombok.Data;

@Data
public class CartCreateDTO {
    private Integer productId;
    private Integer quantity;
}
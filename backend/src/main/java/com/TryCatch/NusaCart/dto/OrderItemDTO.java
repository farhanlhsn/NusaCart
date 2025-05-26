package com.TryCatch.NusaCart.dto;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Integer productId;
    private Integer quantity;
}
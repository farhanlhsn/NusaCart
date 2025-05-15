package com.TryCatch.NusaCart.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderCreateDTO {
    private List<OrderItemDTO> items;
}

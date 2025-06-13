package com.TryCatch.NusaCart.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDTO {
    private Long id;
    private List<OrderItemResponseDTO> items;
    private Double total;
    private LocalDateTime createdAt;
    private String address;
    private PaymentMethodDTO paymentMethod;
    private String paymentStatus;
    private String orderStatus;
}

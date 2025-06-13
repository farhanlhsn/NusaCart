package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateDTO {
    
    @NotBlank(message = "Order status is required")
    private String orderStatus; // PROCESSING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
}
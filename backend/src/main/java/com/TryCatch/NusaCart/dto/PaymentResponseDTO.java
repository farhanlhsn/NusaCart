package com.TryCatch.NusaCart.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PaymentResponseDTO {
    private Long id;
    private Double amount;
    private String method;
    private String status;
    private LocalDateTime paymentDate;
    private Long orderId;
}

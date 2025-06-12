package com.TryCatch.NusaCart.dto;

import lombok.Data;

@Data
public class PaymentRequestDTO {
    private Double amount;
    private String method;
    private Long orderId;
}

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
public class PaymentStatusUpdateDTO {
    
    @NotBlank(message = "Payment status is required")
    private String paymentStatus; // PENDING, PAID, FAILED, CANCELLED
}
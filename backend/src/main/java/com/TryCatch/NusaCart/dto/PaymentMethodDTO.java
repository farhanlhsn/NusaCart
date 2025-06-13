package com.TryCatch.NusaCart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodDTO {
    
    private Integer id;
    
    private String name;
    
    private String description;
    
    private String iconUrl;
    
    private Boolean isActive;
    
    private String type; // BANK_TRANSFER, E_WALLET, CREDIT_CARD, COD
}
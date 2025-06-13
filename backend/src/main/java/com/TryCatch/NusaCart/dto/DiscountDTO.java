package com.TryCatch.NusaCart.dto;

import java.util.Date;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DiscountDTO {
    private String promoCode;
    private String description;
    private double discountPercentage;
    private Date validUntil;
    private int usageLimit;
    private boolean valid; // Represent status from isValid()
}

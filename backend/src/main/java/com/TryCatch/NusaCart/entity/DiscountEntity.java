package com.TryCatch.NusaCart.entity;

import java.util.Date;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "discount_promotion")
public class DiscountEntity {

    @Id
    @Column(name = "promo_code", nullable = false, unique = true, length = 50)
    @NotBlank
    private String promoCode;

    @Column(length = 255)
    private String description;

    @Column(name = "discount_percentage", nullable = false)
    @Min(value = 0)
    @Max(value = 100)
    private double discountPercentage;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "valid_until", nullable = false)
    @NotNull
    private Date validUntil;

    @Column(name = "usage_limit")
    @Min(value = 0)
    private int usageLimit;

    // Check if the promotion is still valid based on the current date and usage limit.
    public boolean isValid() {
        return usageLimit > 0 && validUntil.after(new Date());
    }


    // Update discount percentage and optionally reset usage limit and/or validity.
    public void updateDiscount(double newPercentage, int newUsageLimit, Date newValidUntil) {
        this.discountPercentage = newPercentage;
        this.usageLimit = newUsageLimit;
        this.validUntil = newValidUntil;
    }
}

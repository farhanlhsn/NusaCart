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
    @NotBlank(message = "Promo code must not be blank")
    private String promoCode;

    @Column(length = 255)
    private String description;

    @Column(name = "discount_percentage", nullable = false)
    @Min(value = 0, message = "Discount must be at least 0%")
    @Max(value = 100, message = "Discount cannot exceed 100%")
    private double discountPercentage;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "valid_until", nullable = false)
    @NotNull(message = "Valid until date is required")
    private Date validUntil;

    @Column(name = "usage_limit")
    @Min(value = 0, message = "Usage limit cannot be negative")
    private int usageLimit;

    // --- Logic Methods ---

    /**
     * Check if the promotion is still valid based on the current date and usage limit.
     */
    public boolean isValid() {
        return new Date().before(validUntil) && usageLimit > 0;
    }

    /**
     * Update discount percentage and optionally reset usage limit and/or validity.
     */
    public void updateDiscount(double newPercentage, int newUsageLimit, Date newValidUntil) {
        this.discountPercentage = newPercentage;
        this.usageLimit = newUsageLimit;
        this.validUntil = newValidUntil;
    }
}

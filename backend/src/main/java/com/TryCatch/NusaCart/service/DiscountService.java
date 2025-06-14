package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.DiscountDTO;
import com.TryCatch.NusaCart.entity.DiscountEntity;
import com.TryCatch.NusaCart.repository.DiscountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DiscountService {

    @Autowired
    private DiscountRepository repo;

    public DiscountDTO getPromotionByCode(String promoCode) {
        DiscountEntity promo = repo.findByPromoCode(promoCode).orElseThrow();

        return DiscountDTO.builder()
                .promoCode(promo.getPromoCode())
                .description(promo.getDescription())
                .discountPercentage(promo.getDiscountPercentage())
                .validUntil(promo.getValidUntil())
                .usageLimit(promo.getUsageLimit())
                .valid(promo.isValid())
                .build();
    }

    public void createPromotion(DiscountDTO dto) {
        DiscountEntity promo = DiscountEntity.builder()
                .promoCode(dto.getPromoCode())
                .description(dto.getDescription())
                .discountPercentage(dto.getDiscountPercentage())
                .validUntil(dto.getValidUntil())
                .usageLimit(dto.getUsageLimit())
                .build();

        repo.save(promo);
    }

    public void updatePromotion(String promoCode, DiscountDTO dto) {
        DiscountEntity promo = repo.findByPromoCode(promoCode).orElseThrow();

        promo.updateDiscount(dto.getDiscountPercentage(), dto.getUsageLimit(), dto.getValidUntil());
        promo.setDescription(dto.getDescription());

        repo.save(promo);
    }
}

package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.DiscountDTO;
import com.TryCatch.NusaCart.entity.DiscountEntity;
import com.TryCatch.NusaCart.repository.DiscountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.persistence.EntityNotFoundException;

@Service
public class DiscountService {

    @Autowired
    private DiscountRepository repo;

    public DiscountDTO getPromotionByCode(String promoCode) {
        DiscountEntity promo = repo.findByPromoCode(promoCode).orElseThrow(() -> new EntityNotFoundException("Promo code not found"));

        return DiscountDTO.builder()
                .promoCode(promo.getPromoCode())
                .description(promo.getDescription())
                .discountPercentage(promo.getDiscountPercentage())
                .validUntil(promo.getValidUntil())
                .usageLimit(promo.getUsageLimit())
                .valid(promo.isValid())
                .build();
    }

    public Map<String, Object> createPromotion(DiscountDTO dto) {
        DiscountEntity promo = DiscountEntity.builder()
                .promoCode(dto.getPromoCode())
                .description(dto.getDescription())
                .discountPercentage(dto.getDiscountPercentage())
                .validUntil(dto.getValidUntil())
                .usageLimit(dto.getUsageLimit())
                .build();

        repo.save(promo);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Promo code created successfully");
        response.put("data", promo);
        return response;
    }

    public Map<String, Object> updatePromotion(String promoCode, DiscountDTO dto) {
        DiscountEntity promo = repo.findByPromoCode(promoCode).orElseThrow(() -> new EntityNotFoundException("Promo code not found"));

        promo.updateDiscount(dto.getDiscountPercentage(), dto.getUsageLimit(), dto.getValidUntil());
        promo.setDescription(dto.getDescription());

        repo.save(promo);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Promo code updated successfully");
        response.put("data", promo);
        return response;
    }

    public List<DiscountDTO> getAllPromotions() {
        List<DiscountEntity> promotions = repo.findAll();
        return promotions.stream()
                .map(promo -> DiscountDTO.builder()
                        .promoCode(promo.getPromoCode())
                        .description(promo.getDescription())
                        .discountPercentage(promo.getDiscountPercentage())
                        .validUntil(promo.getValidUntil())
                        .usageLimit(promo.getUsageLimit())
                        .valid(promo.isValid())
                        .build())
                .collect(Collectors.toList());
    }

    public Map<String, String> usePromotion(String promoCode) {
        Map<String, String> response = new HashMap<>();
        DiscountEntity promo = repo.findByPromoCode(promoCode).orElseThrow(() -> new EntityNotFoundException("Promo code not found"));

        if (!promo.isValid() || promo.getUsageLimit() <= 0) {
            throw new IllegalArgumentException("Promo code is not valid or has expired");
        }
        promo.setUsageLimit(promo.getUsageLimit() - 1);
        repo.save(promo);
        response.put("message", "Promo code is valid");
        response.put("discountPercentage", String.valueOf(promo.getDiscountPercentage()));

        return response;
    }

    public Map<String, String> deletePromotion(String promoCode) {
        Map<String, String> response = new HashMap<>();
        DiscountEntity promo = repo.findByPromoCode(promoCode).orElseThrow(() -> new EntityNotFoundException("Promo code not found"));

        repo.delete(promo);
        response.put("message", "Promo code deleted successfully");
        return response;
    }
}

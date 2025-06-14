package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.DiscountDTO;
import com.TryCatch.NusaCart.service.DiscountService;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService DPService;

    // Ambil detail promo berdasarkan kode
    @GetMapping("/{promoCode}")
    public Map<String, Object> getPromotion(@PathVariable String promoCode) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Promo code fetched successfully");
        response.put("data", DPService.getPromotionByCode(promoCode));
        return response;
    }

    // Buat promo baru
    @PostMapping
    public Map<String, Object> createPromotion(@RequestBody DiscountDTO dto) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Promo code created successfully");
        response.put("data", DPService.createPromotion(dto));
        return response;
    }

    // Update promo berdasarkan kode
    @PutMapping("/{promoCode}")
    public Map<String, Object> updatePromotion(@PathVariable String promoCode, @RequestBody DiscountDTO dto) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Promo code updated successfully");
        response.put("data", DPService.updatePromotion(promoCode, dto));
        return response;
    }

    // Hapus promo berdasarkan kode
    @DeleteMapping("/{promoCode}")
    public Map<String, String> deletePromotion(@PathVariable String promoCode) {
        return DPService.deletePromotion(promoCode);
    }

    // Ambil semua promo
    @GetMapping
    public Map<String, Object> getAllPromotions() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Promo codes fetched successfully");
        response.put("data", DPService.getAllPromotions());
        return response;
    }

    // Gunakan promo berdasarkan kode
    @PostMapping("/use/{promoCode}")
    public Map<String, String> usePromotion(@PathVariable String promoCode) {   
        return DPService.usePromotion(promoCode);
    }
}

package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.DiscountDTO;
import com.TryCatch.NusaCart.service.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService DPService;

    // Ambil detail promo berdasarkan kode
    @GetMapping("/{promoCode}")
    public DiscountDTO getPromotion(@PathVariable String promoCode) {
        return DPService.getPromotionByCode(promoCode);
    }

    // Buat promo baru
    @PostMapping
    public void createPromotion(@RequestBody DiscountDTO dto) {
        DPService.createPromotion(dto);
    }

    // Update promo berdasarkan kode
    @PutMapping("/{promoCode}")
    public void updatePromotion(@PathVariable String promoCode, @RequestBody DiscountDTO dto) {
        DPService.updatePromotion(promoCode, dto);
    }
}

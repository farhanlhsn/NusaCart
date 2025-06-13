package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.ReviewDTO;
import com.TryCatch.NusaCart.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // Ambil semua review untuk suatu produk
    @GetMapping("/product/{productId}")
    public List<ReviewDTO> getReviewsByProduct(@PathVariable int productId) {
        return reviewService.getReviewsByProduct(productId);
    }

    // Buat review baru
    @PostMapping
    public void createReview(@RequestBody ReviewDTO dto) {
        reviewService.createReview(dto);
    }

    // Update review berdasarkan reviewId
    @PutMapping("/{reviewId}")
    public void updateReview(@PathVariable String reviewId, @RequestBody ReviewDTO dto) {
        reviewService.updateReview(reviewId, dto);
    }
}

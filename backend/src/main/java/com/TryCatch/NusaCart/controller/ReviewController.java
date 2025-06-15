package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.ReviewDTO;
import com.TryCatch.NusaCart.service.ReviewService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
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
    @PostMapping("/product/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void createReviewByProduct(@PathVariable Integer productId, @RequestBody ReviewDTO dto) {
        reviewService.createReviewByProduct(productId, dto);
    }

    // Update review berdasarkan reviewId
    @PutMapping("/{reviewId}")
    @ResponseStatus(HttpStatus.OK)
    public void updateReview(@PathVariable Integer reviewId, @RequestBody ReviewDTO dto) {
        reviewService.updateReview(reviewId, dto);
    }
}

package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.ReviewDTO;
import com.TryCatch.NusaCart.entity.ProductEntity;
import com.TryCatch.NusaCart.entity.ReviewEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.repository.ProductRepository;
import com.TryCatch.NusaCart.repository.ReviewRepository;
import com.TryCatch.NusaCart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<ReviewDTO> getReviewsByProduct(int productId) {
        ProductEntity product = productRepository.findById(productId).orElseThrow();
        return reviewRepository.findByProduct(product).stream().map(this::toDTO).collect(Collectors.toList());
    }

    private UserEntity getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (UserEntity) auth.getPrincipal();
    }

    public void createReviewByProduct(Integer productId, ReviewDTO dto) {
        UserEntity user = getCurrentUser();
        ProductEntity product = productRepository.findById(productId).orElseThrow();

        ReviewEntity review = ReviewEntity.builder()
                .user(user)
                .product(product)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .createdAt(new Date())
                .build();

        reviewRepository.save(review);
    }

    public void updateReview(Integer reviewId, ReviewDTO dto) {
        ReviewEntity review = reviewRepository.findByReviewId(reviewId).orElseThrow();
        review.editReview(dto.getComment(), dto.getRating());
        reviewRepository.save(review);
    }

    private ReviewDTO toDTO(ReviewEntity review) {
        return ReviewDTO.builder()
                .reviewId(review.getReviewId())
                .userId(review.getUser().getUserId())
                .productId(review.getProduct().getProductId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

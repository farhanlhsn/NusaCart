package com.TryCatch.NusaCart.dto;

import java.util.Date;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewDTO {
    private String reviewId;
    private Integer userId; // Only the ID is sent, not the full UserEntity
    private Integer productId; // Only the ID is sent, not the full Product
    private int rating;
    private String comment;
    private Date createdAt;
}

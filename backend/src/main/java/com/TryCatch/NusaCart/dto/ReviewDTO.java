package com.TryCatch.NusaCart.dto;

import java.util.Date;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class ReviewDTO {
    private Integer reviewId;

    @NotNull
    private Integer userId;

    @NotNull
    private Integer productId;

    @Min(1)
    @Max(5)
    private int rating;

    @NotBlank
    private String comment;

    private Date createdAt;
}

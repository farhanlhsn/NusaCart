package com.TryCatch.NusaCart.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackingDTO {

    private Integer trackingId;
    private String status;
    private String description;
    private LocalDateTime updatedAt;
}

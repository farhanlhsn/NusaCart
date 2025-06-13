package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportChatDTO {

    @NotNull(message = "Reported user ID is required")
    private Integer reportedUserId;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String description;

    private Integer reporterId;
}

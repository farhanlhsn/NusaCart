package com.TryCatch.NusaCart.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private UserResponseDTO user;
    private String message;
    private LocalDateTime loginTime;
}

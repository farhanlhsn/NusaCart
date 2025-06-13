package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BuyerSellerChatDTO {

    private Integer chatId;

    @NotNull(message = "Sender ID tidak boleh null")
    private Integer senderId;

    @NotNull(message = "Receiver ID tidak boleh null")
    private Integer receiverId;

    @NotBlank(message = "Pesan tidak boleh kosong")
    private String message;

    private String timestamp;

    private Integer productId;

    private Integer orderId;
}
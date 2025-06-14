package com.TryCatch.NusaCart.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WishlistResponseDTO {
    private String status;
    private String message;
    private WishlistResponseDTO data;
    
    // Fields untuk data wishlist
    private Integer wishlistId;
    private Integer userId;
    private List<ProductResponseDTO> products;
    
    // Constructor untuk response sukses dengan data
    public WishlistResponseDTO(String message, WishlistResponseDTO data) {
        this.status = "success";
        this.message = message;
        this.data = data;
    }
    
    // Constructor untuk response error tanpa data
    public WishlistResponseDTO(String status, String message) {
        this.status = status;
        this.message = message;
        this.data = null;
    }
}
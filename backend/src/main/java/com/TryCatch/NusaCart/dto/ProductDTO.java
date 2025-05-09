package com.TryCatch.NusaCart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Integer productId;
    private String productName;
    private String description;
    private Double price;
    private Integer stock;
    private Integer idToko;
    private String namaToko;
    private String imageUrl;
    private String category;
    private Boolean isActive;
}

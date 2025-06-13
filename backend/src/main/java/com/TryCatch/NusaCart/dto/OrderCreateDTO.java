package com.TryCatch.NusaCart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class OrderCreateDTO {

    @NotBlank(message = "Address is required")
    private String address;

    private List<OrderItemDTO> items;

    private Integer addressId;
    
    private Integer paymentMethodId;

}

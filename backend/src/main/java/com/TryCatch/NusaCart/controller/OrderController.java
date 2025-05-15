package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.OrderCreateDTO;
import com.TryCatch.NusaCart.dto.OrderResponseDTO;
import com.TryCatch.NusaCart.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public void placeOrder(@RequestBody OrderCreateDTO dto, Principal principal) {
        orderService.placeOrder(principal.getName(), dto);
    }

    @GetMapping
    public List<OrderResponseDTO> getOrders(Principal principal) {
        return orderService.getOrders(principal.getName());
    }
}

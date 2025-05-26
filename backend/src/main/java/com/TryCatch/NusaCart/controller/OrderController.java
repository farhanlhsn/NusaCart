package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.OrderCreateDTO;
import com.TryCatch.NusaCart.dto.OrderResponseDTO;
import com.TryCatch.NusaCart.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    @Autowired
    private final OrderService orderService;
    
    @PostMapping
public ResponseEntity<Map<String, String>> placeOrder(@RequestBody OrderCreateDTO dto) {
    Map<String, String> response = orderService.placeOrder(dto);
    return ResponseEntity.ok(response);
}

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getOrders() {
        List<OrderResponseDTO> orders = orderService.getOrders();
        return ResponseEntity.ok(orders);
    }
}

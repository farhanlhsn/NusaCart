package com.TryCatch.NusaCart.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.TryCatch.NusaCart.service.PaymentService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payments")
@Slf4j
public class PaymentController {

    @Autowired
    private PaymentService paymentService;
    
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
    
    // Update payment status
    @PutMapping("/orders/{orderId}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Long orderId, 
            @RequestBody Map<String, String> request) {
        
        log.info("PUT request to update payment status for order: {}", orderId);
        
        try {
            String paymentStatus = request.get("paymentStatus");
            
            if (paymentStatus == null || paymentStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Payment status is required"
                ));
            }
            
            Map<String, String> response = paymentService.updatePaymentStatus(orderId, paymentStatus);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", response.get("message"),
                "data", Map.of(
                    "paymentStatus", response.get("paymentStatus"),
                    "orderStatus", response.get("orderStatus")
                )
            ));
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid payment status: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error updating payment status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Failed to update payment status"
            ));
        }
    }
    
    // Update order status
    @PutMapping("/orders/{orderId}/order-status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId, 
            @RequestBody Map<String, String> request) {
        
        log.info("PUT request to update order status for order: {}", orderId);
        
        try {
            String orderStatus = request.get("orderStatus");
            
            if (orderStatus == null || orderStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Order status is required"
                ));
            }
            
            Map<String, String> response = paymentService.updateOrderStatus(orderId, orderStatus);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", response.get("message"),
                "data", Map.of(
                    "orderStatus", response.get("orderStatus")
                )
            ));
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid order status: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error updating order status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Failed to update order status"
            ));
        }
    }
}
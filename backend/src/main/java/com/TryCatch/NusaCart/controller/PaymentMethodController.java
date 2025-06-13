package com.TryCatch.NusaCart.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.TryCatch.NusaCart.dto.PaymentMethodDTO;
import com.TryCatch.NusaCart.service.PaymentMethodService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payment-methods")
@Slf4j
public class PaymentMethodController {

    @Autowired
    private PaymentMethodService paymentMethodService;
    
    public PaymentMethodController(PaymentMethodService paymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }
    
    // Get all payment methods
    @GetMapping
    public ResponseEntity<?> getAllPaymentMethods() {
        log.info("GET request to fetch all payment methods");
        
        try {
            List<PaymentMethodDTO> paymentMethods = paymentMethodService.getAllPaymentMethods();
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Payment methods retrieved successfully",
                "data", paymentMethods
            ));
            
        } catch (Exception e) {
            log.error("Error fetching payment methods: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Failed to retrieve payment methods"
            ));
        }
    }
    
    // Get active payment methods only
    @GetMapping("/active")
    public ResponseEntity<?> getActivePaymentMethods() {
        log.info("GET request to fetch active payment methods");
        
        try {
            List<PaymentMethodDTO> paymentMethods = paymentMethodService.getActivePaymentMethods();
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Active payment methods retrieved successfully",
                "data", paymentMethods
            ));
            
        } catch (Exception e) {
            log.error("Error fetching active payment methods: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Failed to retrieve active payment methods"
            ));
        }
    }
    
    // Get payment methods by type
    @GetMapping("/by-type")
    public ResponseEntity<?> getPaymentMethodsByType(@RequestParam String type) {
        log.info("GET request to fetch payment methods by type: {}", type);
        
        try {
            List<PaymentMethodDTO> paymentMethods = paymentMethodService.getPaymentMethodsByType(type);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Payment methods by type retrieved successfully",
                "data", paymentMethods
            ));
            
        } catch (Exception e) {
            log.error("Error fetching payment methods by type: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Failed to retrieve payment methods by type"
            ));
        }
    }
}
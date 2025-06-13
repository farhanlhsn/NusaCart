package com.TryCatch.NusaCart.service;

import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.TryCatch.NusaCart.entity.OrderEntity;
import com.TryCatch.NusaCart.repository.OrderRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional
public class PaymentService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserService userService;
    
    public PaymentService(OrderRepository orderRepository, UserService userService) {
        this.orderRepository = orderRepository;
        this.userService = userService;
    }
    
    // Update payment status
    public Map<String, String> updatePaymentStatus(Long orderId, String paymentStatus) {
        log.info("Updating payment status for order {} to {}", orderId, paymentStatus);
        
        Integer currentUserId = userService.getCurrentUser().getUserId();
        
        OrderEntity order = orderRepository.findById(orderId)
                .filter(o -> o.getUser().getUserId().equals(currentUserId))
                .orElseThrow(() -> new EntityNotFoundException("Order not found or access denied"));
        
        // Validate payment status
        if (!isValidPaymentStatus(paymentStatus)) {
            throw new IllegalArgumentException("Invalid payment status: " + paymentStatus);
        }
        
        order.setPaymentStatus(paymentStatus);
        
        // Auto-update order status based on payment status
        if ("PAID".equals(paymentStatus)) {
            order.setOrderStatus("CONFIRMED");
        } else if ("FAILED".equals(paymentStatus) || "CANCELLED".equals(paymentStatus)) {
            order.setOrderStatus("CANCELLED");
        }
        
        orderRepository.save(order);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Payment status updated successfully");
        response.put("paymentStatus", paymentStatus);
        response.put("orderStatus", order.getOrderStatus());
        
        return response;
    }
    
    // Update order status
    public Map<String, String> updateOrderStatus(Long orderId, String orderStatus) {
        log.info("Updating order status for order {} to {}", orderId, orderStatus);
        
        Integer currentUserId = userService.getCurrentUser().getUserId();
        
        OrderEntity order = orderRepository.findById(orderId)
                .filter(o -> o.getUser().getUserId().equals(currentUserId))
                .orElseThrow(() -> new EntityNotFoundException("Order not found or access denied"));
        
        // Validate order status
        if (!isValidOrderStatus(orderStatus)) {
            throw new IllegalArgumentException("Invalid order status: " + orderStatus);
        }
        
        order.setOrderStatus(orderStatus);
        orderRepository.save(order);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Order status updated successfully");
        response.put("orderStatus", orderStatus);
        
        return response;
    }
    
    // Validate payment status
    private boolean isValidPaymentStatus(String status) {
        return status != null && 
               ("PENDING".equals(status) || "PAID".equals(status) || 
                "FAILED".equals(status) || "CANCELLED".equals(status));
    }
    
    // Validate order status
    private boolean isValidOrderStatus(String status) {
        return status != null && 
               ("PROCESSING".equals(status) || "CONFIRMED".equals(status) || 
                "SHIPPED".equals(status) || "DELIVERED".equals(status) || 
                "CANCELLED".equals(status));
    }
}
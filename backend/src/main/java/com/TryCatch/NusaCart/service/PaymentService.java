package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.PaymentRequestDTO;
import com.TryCatch.NusaCart.dto.PaymentResponseDTO;
import com.TryCatch.NusaCart.entity.OrderEntity;
import com.TryCatch.NusaCart.entity.PaymentEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.repository.OrderRepository;
import com.TryCatch.NusaCart.repository.PaymentRepository;
import com.TryCatch.NusaCart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    public PaymentResponseDTO processPayment(PaymentRequestDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserEntity user = (UserEntity) authentication.getPrincipal();

        OrderEntity order = orderRepository.findById(dto.getOrderId())
            .orElseThrow(() -> new RuntimeException("Order not found"));

        PaymentEntity payment = new PaymentEntity();
        payment.setUser(user);
        payment.setAmount(dto.getAmount());
        payment.setMethod(dto.getMethod());
        payment.setStatus("COMPLETED"); // Simulated; integrate gateway for real logic
        payment.setPaymentDate(LocalDateTime.now());
        payment.setOrder(order);

        PaymentEntity saved = paymentRepository.save(payment);

        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setId(saved.getId());
        response.setAmount(saved.getAmount());
        response.setMethod(saved.getMethod());
        response.setStatus(saved.getStatus());
        response.setPaymentDate(saved.getPaymentDate());
        response.setOrderId(saved.getOrder().getId());

        return response;
    }

    public List<PaymentResponseDTO> getUserPayments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserEntity user = (UserEntity) authentication.getPrincipal();

        return paymentRepository.findByUser(user).stream().map(payment -> {
            PaymentResponseDTO dto = new PaymentResponseDTO();
            dto.setId(payment.getId());
            dto.setAmount(payment.getAmount());
            dto.setMethod(payment.getMethod());
            dto.setStatus(payment.getStatus());
            dto.setPaymentDate(payment.getPaymentDate());
            dto.setOrderId(payment.getOrder() != null ? payment.getOrder().getId() : null);
            return dto;
        }).collect(Collectors.toList());
    }
}

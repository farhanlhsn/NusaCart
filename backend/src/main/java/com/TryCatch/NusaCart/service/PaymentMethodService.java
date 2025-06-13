package com.TryCatch.NusaCart.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.TryCatch.NusaCart.dto.PaymentMethodDTO;
import com.TryCatch.NusaCart.entity.PaymentMethodEntity;
import com.TryCatch.NusaCart.repository.PaymentMethodRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaymentMethodService {

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;
    
    public PaymentMethodService(PaymentMethodRepository paymentMethodRepository) {
        this.paymentMethodRepository = paymentMethodRepository;
    }
    
    // Get all payment methods
    public List<PaymentMethodDTO> getAllPaymentMethods() {
        log.info("Getting all payment methods");
        return paymentMethodRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get all active payment methods
    public List<PaymentMethodDTO> getActivePaymentMethods() {
        log.info("Getting all active payment methods");
        return paymentMethodRepository.findByIsActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get payment methods by type
    public List<PaymentMethodDTO> getPaymentMethodsByType(String type) {
        log.info("Getting payment methods by type: {}", type);
        return paymentMethodRepository.findByTypeAndIsActiveTrue(type)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Convert entity to DTO
    private PaymentMethodDTO convertToDTO(PaymentMethodEntity entity) {
        return PaymentMethodDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .iconUrl(entity.getIconUrl())
                .isActive(entity.getIsActive())
                .type(entity.getType())
                .build();
    }
}
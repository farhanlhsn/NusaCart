package com.TryCatch.NusaCart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.TryCatch.NusaCart.entity.PaymentMethodEntity;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethodEntity, Integer> {
    
    // Find all active payment methods
    List<PaymentMethodEntity> findByIsActiveTrue();
    
    // Find payment method by name
    Optional<PaymentMethodEntity> findByName(String name);
    
    // Find payment methods by type
    List<PaymentMethodEntity> findByType(String type);
    
    // Find active payment methods by type
    List<PaymentMethodEntity> findByTypeAndIsActiveTrue(String type);
}
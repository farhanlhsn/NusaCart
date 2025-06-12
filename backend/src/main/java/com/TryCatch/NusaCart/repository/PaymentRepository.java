package com.TryCatch.NusaCart.repository;

import com.TryCatch.NusaCart.entity.PaymentEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
    List<PaymentEntity> findByUser(UserEntity user);
}

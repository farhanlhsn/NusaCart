package com.TryCatch.NusaCart.repository;

import com.TryCatch.NusaCart.entity.OrderEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByUser(UserEntity user);
}
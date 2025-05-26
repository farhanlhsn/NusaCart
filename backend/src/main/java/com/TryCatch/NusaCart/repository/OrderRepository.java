package com.TryCatch.NusaCart.repository;

import com.TryCatch.NusaCart.entity.OrderEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    // Get all orders for a specific user
    List<OrderEntity> findByUser(UserEntity user);

    // Optional: For safety when querying by ID
    Optional<OrderEntity> findById(Integer orderId);
}

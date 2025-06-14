package com.TryCatch.NusaCart.repository;

import com.TryCatch.NusaCart.entity.CartEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<CartEntity, Long> {
    Optional<CartEntity> findByUser(UserEntity user);
    void deleteByUserAndProductId(UserEntity user, Integer productId);
}

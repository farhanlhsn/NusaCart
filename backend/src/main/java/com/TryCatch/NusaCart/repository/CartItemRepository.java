package com.TryCatch.NusaCart.repository;

import com.TryCatch.NusaCart.entity.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {
}

package com.TryCatch.NusaCart.repository;

import com.TryCatch.NusaCart.entity.CartEntity;
import com.TryCatch.NusaCart.entity.CartItemEntity;
import com.TryCatch.NusaCart.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {

    List<CartItemEntity> findByCart(CartEntity cart);

    List<CartItemEntity> findByCartAndProduct(CartEntity cart, ProductEntity product);

    void deleteByCartAndProduct(CartEntity cart, ProductEntity product);
}

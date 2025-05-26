package com.TryCatch.NusaCart.repository;


import com.TryCatch.NusaCart.entity.CartEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartRepository extends JpaRepository<CartEntity, Long> {
    List<CartEntity> findByUser(UserEntity user);
}

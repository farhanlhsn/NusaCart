package com.TryCatch.NusaCart.repository;

import com.TryCatch.NusaCart.entity.WishlistEntity;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistEntity, Integer> {

    Optional<WishlistEntity> findById(Integer id);
}


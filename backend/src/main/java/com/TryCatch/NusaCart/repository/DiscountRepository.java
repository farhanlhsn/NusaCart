package com.TryCatch.NusaCart.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.TryCatch.NusaCart.entity.DiscountEntity;

@Repository
public interface DiscountRepository extends JpaRepository<DiscountEntity, String> {

    // Cari promo berdasarkan kode
    Optional<DiscountEntity> findByPromoCode(String promoCode);

    // Cek apakah promo dengan kode tertentu tersedia
    boolean existsByPromoCode(String promoCode);
}

package com.TryCatch.NusaCart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.TryCatch.NusaCart.entity.ReviewEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.entity.ProductEntity;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, String> {
    
    // Cari review berdasarkan ID
    Optional<ReviewEntity> findByReviewId(Integer reviewId);
    
    // Cari semua review dari seorang user
    List<ReviewEntity> findByUser(UserEntity user);

    // Cari semua review untuk produk tertentu
    List<ReviewEntity> findByProduct(ProductEntity product);

    // Cek apakah user sudah pernah review produk ini
    boolean existsByUserAndProduct(UserEntity user, ProductEntity product);
}

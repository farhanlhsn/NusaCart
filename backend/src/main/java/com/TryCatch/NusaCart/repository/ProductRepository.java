package com.TryCatch.NusaCart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.TryCatch.NusaCart.entity.CategoryEntity;
import com.TryCatch.NusaCart.entity.ProductEntity;
import com.TryCatch.NusaCart.entity.TokoEntity;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Integer> {
    
    Optional<ProductEntity> findByProductId(Long productId);
    
    List<ProductEntity> findByToko(TokoEntity toko);
    
    List<ProductEntity> findByCategory(CategoryEntity category);
    
    List<ProductEntity> findByProductNameContainingIgnoreCase(String productName);
    
    List<ProductEntity> findByProductNameContainingIgnoreCaseAndToko(String productName, TokoEntity toko);
    
    List<ProductEntity> findByProductNameContainingIgnoreCaseAndCategory(String productName, CategoryEntity category);
    
    List<ProductEntity> findByPriceBetween(Double minPrice, Double maxPrice);
    
    List<ProductEntity> findByPriceBetweenAndToko(Double minPrice, Double maxPrice, TokoEntity toko);
    
    List<ProductEntity> findByIsActiveTrue();
    
    List<ProductEntity> findByIsActiveTrueAndToko(TokoEntity toko);
    
    List<ProductEntity> findByTokoAndIsActiveTrue(TokoEntity toko);
    
    List<ProductEntity> findByCategoryAndIsActiveTrue(CategoryEntity category);
    
    @Query("SELECT p FROM ProductEntity p WHERE p.toko.seller.userId = :sellerId")
    List<ProductEntity> findBySellerUserId(Integer sellerId);
    
    boolean existsByProductNameAndToko(String productName, TokoEntity toko);
}

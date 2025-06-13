package com.TryCatch.NusaCart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.TryCatch.NusaCart.entity.CategoryEntity;
import com.TryCatch.NusaCart.entity.ProductEntity;
import com.TryCatch.NusaCart.entity.TokoEntity;
import com.TryCatch.NusaCart.enums.GeneralCategory;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Integer> {
    
    Optional<ProductEntity> findByProductId(Integer productId);
    
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
    
    // Advanced filtering with pagination using database queries
    @Query("SELECT p FROM ProductEntity p WHERE " +
           "(:categoryId IS NULL OR p.category.idCategory = :categoryId) AND " +
           "(:tokoId IS NULL OR p.toko.idToko = :tokoId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minStock IS NULL OR p.stock >= :minStock) AND " +
           "(:productName IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :productName, '%'))) AND " +
           "(:generalCategory IS NULL OR p.generalCategory = :generalCategory) AND " +
           "(:activeOnly IS NULL OR :activeOnly = false OR p.isActive = true)")
    Page<ProductEntity> findProductsWithFilters(
            @Param("categoryId") Integer categoryId,
            @Param("tokoId") Integer tokoId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minStock") Integer minStock,
            @Param("productName") String productName,
            @Param("generalCategory") GeneralCategory generalCategory,
            @Param("activeOnly") Boolean activeOnly,
            Pageable pageable);
    
    // Count method for filtered products
    @Query("SELECT COUNT(p) FROM ProductEntity p WHERE " +
           "(:categoryId IS NULL OR p.category.idCategory = :categoryId) AND " +
           "(:tokoId IS NULL OR p.toko.idToko = :tokoId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minStock IS NULL OR p.stock >= :minStock) AND " +
           "(:productName IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :productName, '%'))) AND " +
           "(:generalCategory IS NULL OR p.generalCategory = :generalCategory) AND " +
           "(:activeOnly IS NULL OR :activeOnly = false OR p.isActive = true)")
    Long countProductsWithFilters(
            @Param("categoryId") Integer categoryId,
            @Param("tokoId") Integer tokoId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minStock") Integer minStock,
            @Param("productName") String productName,
            @Param("generalCategory") GeneralCategory generalCategory,
            @Param("activeOnly") Boolean activeOnly);
    
    // Alternative method without pagination for simple filtering
    @Query("SELECT p FROM ProductEntity p WHERE " +
           "(:categoryId IS NULL OR p.category.idCategory = :categoryId) AND " +
           "(:tokoId IS NULL OR p.toko.idToko = :tokoId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minStock IS NULL OR p.stock >= :minStock) AND " +
           "(:productName IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :productName, '%'))) AND " +
           "(:generalCategory IS NULL OR p.generalCategory = :generalCategory) AND " +
           "(:activeOnly IS NULL OR :activeOnly = false OR p.isActive = true) " +
           "ORDER BY p.createdAt DESC")
    List<ProductEntity> findProductsWithFiltersNoPage(
            @Param("categoryId") Integer categoryId,
            @Param("tokoId") Integer tokoId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minStock") Integer minStock,
            @Param("productName") String productName,
            @Param("generalCategory") GeneralCategory generalCategory,
            @Param("activeOnly") Boolean activeOnly);
    
    // Method for getting products with custom sorting
    @Query("SELECT p FROM ProductEntity p WHERE " +
           "(:categoryId IS NULL OR p.category.idCategory = :categoryId) AND " +
           "(:tokoId IS NULL OR p.toko.idToko = :tokoId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minStock IS NULL OR p.stock >= :minStock) AND " +
           "(:productName IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :productName, '%'))) AND " +
           "(:generalCategory IS NULL OR p.generalCategory = :generalCategory) AND " +
           "(:activeOnly IS NULL OR :activeOnly = false OR p.isActive = true)")
    Page<ProductEntity> findProductsWithFiltersAndSort(
            @Param("categoryId") Integer categoryId,
            @Param("tokoId") Integer tokoId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minStock") Integer minStock,
            @Param("productName") String productName,
            @Param("generalCategory") GeneralCategory generalCategory,
            @Param("activeOnly") Boolean activeOnly,
            Pageable pageable);
}
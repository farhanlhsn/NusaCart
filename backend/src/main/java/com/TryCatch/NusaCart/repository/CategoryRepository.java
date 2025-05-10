package com.TryCatch.NusaCart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.TryCatch.NusaCart.entity.CategoryEntity;
import com.TryCatch.NusaCart.entity.TokoEntity;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Integer> {
    
    // Find category by ID
    Optional<CategoryEntity> findByIdCategory(Integer idCategory);
    
    // Find categories by toko
    List<CategoryEntity> findByToko(TokoEntity toko);
    
    // Find categories by toko ID
    List<CategoryEntity> findByTokoIdToko(Integer idToko);
    
    // Find category by name and toko
    Optional<CategoryEntity> findByNamaCategoryAndToko(String namaCategory, TokoEntity toko);
    
    // Check if category exists by name and toko
    boolean existsByNamaCategoryAndToko(String namaCategory, TokoEntity toko);
    
    // Search categories by name containing (case insensitive)
    List<CategoryEntity> findByNamaCategoryContainingIgnoreCase(String namaCategory);
    
    // Search categories by name containing and toko
    List<CategoryEntity> findByNamaCategoryContainingIgnoreCaseAndToko(String namaCategory, TokoEntity toko);
}

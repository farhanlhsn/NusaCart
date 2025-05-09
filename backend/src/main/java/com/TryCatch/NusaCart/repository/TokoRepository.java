package com.TryCatch.NusaCart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.TryCatch.NusaCart.entity.TokoEntity;
import com.TryCatch.NusaCart.entity.UserEntity;

@Repository
public interface TokoRepository extends JpaRepository<TokoEntity, Integer> {
    // Find store by ID
    Optional<TokoEntity> findByIdToko(Integer idToko);
    
    // Find stores by seller
    List<TokoEntity> findBySeller(UserEntity seller);
    
    // Find store by name (for search functionality)
    List<TokoEntity> findByNamaTokoContainingIgnoreCase(String namaToko);
    
    // Check if store name exists
    boolean existsByNamaToko(String namaToko);
    
    // Check if seller already has a store with the same name
    boolean existsBySellerAndNamaToko(UserEntity seller, String namaToko);
    
    // Check if email is already used
    boolean existsByEmailToko(String emailToko);
}

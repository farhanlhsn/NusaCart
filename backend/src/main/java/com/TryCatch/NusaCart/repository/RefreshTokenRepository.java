package com.TryCatch.NusaCart.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.TryCatch.NusaCart.entity.RefreshTokenEntity;
import com.TryCatch.NusaCart.entity.UserEntity;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, Integer> {

    Optional<RefreshTokenEntity> findByToken(String token);
    
    void deleteByUser(UserEntity user);
    
    void deleteByToken(String token);
    
    void deleteByExpiredAtBefore(LocalDateTime date);
    
    boolean existsByToken(String token);
}
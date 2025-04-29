package com.TryCatch.NusaCart.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.TryCatch.NusaCart.entity.User;

import jakarta.transaction.Transactional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // Mencari user berdasarkan email (untuk login dan validasi)
    Optional<User> findByEmail(String email);

    // Cek apakah email sudah terdaftar (untuk validasi registrasi)
    boolean existsByEmail(String email);

    // Update status login user
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.isLogin = :status, u.lastLogin = CASE WHEN :status = true THEN CURRENT_TIMESTAMP ELSE u.lastLogin END WHERE u.userId = :userId")
    void updateLoginStatus(@Param("userId") String userId, @Param("status") boolean status);
    
}

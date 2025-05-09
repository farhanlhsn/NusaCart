package com.TryCatch.NusaCart.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.TryCatch.NusaCart.entity.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {
    // Mencari user berdasarkan email (untuk login dan validasi)
    Optional<UserEntity> findByEmail(String email);

    // Mencari user berdasarkan userId (untuk mendapatkan informasi user)
    Optional<UserEntity> findByUserId(Integer userId);

    // Cek apakah email sudah terdaftar (untuk validasi registrasi)
    boolean existsByEmail(String email);

    /* Optional<User> findFirstByToken(String token); */
}

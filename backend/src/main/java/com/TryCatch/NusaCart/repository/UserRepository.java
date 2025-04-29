package com.TryCatch.NusaCart.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.TryCatch.NusaCart.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // Mencari user berdasarkan email (untuk login dan validasi)
    Optional<User> findByEmail(String email);

    // Cek apakah email sudah terdaftar (untuk validasi registrasi)
    boolean existsByEmail(String email);

    Optional<User> findFirstByToken(String token);
}

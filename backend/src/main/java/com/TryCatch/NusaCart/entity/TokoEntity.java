package com.TryCatch.NusaCart.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "toko")
public class TokoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idToko;

    @Column(nullable = false)
    private String namaToko;

    @Column(columnDefinition = "TEXT")
    private String deskripsiToko;

    @Column(nullable = false)
    private String alamatToko;

    @ManyToOne
    @JoinColumn(name = "id_seller", nullable = false)
    private UserEntity seller;

    @Column(nullable = false)
    private String noTelpToko;

    @Column(nullable = false)
    private String emailToko;

    private String profilePictureToko;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // JPA Callback Method
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
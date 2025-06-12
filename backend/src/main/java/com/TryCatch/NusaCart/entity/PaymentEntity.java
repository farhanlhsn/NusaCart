package com.TryCatch.NusaCart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
public class PaymentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String method; // e.g., "Credit Card", "Bank Transfer", "OVO", etc.

    @Column(nullable = false)
    private String status; // e.g., "PENDING", "COMPLETED", "FAILED"

    @Column(nullable = false)
    private LocalDateTime paymentDate;

    @OneToOne
    @JoinColumn(name = "order_id")
    private OrderEntity order;
}

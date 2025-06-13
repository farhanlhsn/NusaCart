package com.TryCatch.NusaCart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private UserEntity user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItemEntity> items;

    private Double total;

    private LocalDateTime createdAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "address_id", nullable = false)
    private AddressEntity address;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "payment_method_id", nullable = false)
    private PaymentMethodEntity paymentMethod;
    
    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus = "PAID"; // PENDING, PAID, FAILED, CANCELLED
    
    @Column(name = "order_status", nullable = false, length = 50)
    private String orderStatus = "PROCESSING"; // PROCESSING, SHIPPED, DELIVERED, CANCELLED
}

package com.TryCatch.NusaCart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
public class OrderItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private OrderEntity order;

    @ManyToOne(optional = false)
    private ProductEntity product;

    private Integer quantity;

    private Double price;
}

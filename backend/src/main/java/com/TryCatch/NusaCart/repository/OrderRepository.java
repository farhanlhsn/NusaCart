package com.TryCatch.NusaCart.repository;

import com.TryCatch.NusaCart.entity.OrderEntity;
import com.TryCatch.NusaCart.entity.UserEntity;
import com.TryCatch.NusaCart.entity.TokoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    // Get all orders for a specific user
    List<OrderEntity> findByUser(UserEntity user);

    // Optional: For safety when querying by ID
    Optional<OrderEntity> findById(Integer orderId);
    
    // Analytics queries for seller
    @Query("SELECT o FROM OrderEntity o JOIN o.items oi JOIN oi.product p WHERE p.toko = :toko")
    List<OrderEntity> findOrdersByToko(@Param("toko") TokoEntity toko);
    
    @Query("SELECT o FROM OrderEntity o JOIN o.items oi JOIN oi.product p WHERE p.toko = :toko AND o.createdAt BETWEEN :startDate AND :endDate")
    List<OrderEntity> findOrdersByTokoAndDateRange(@Param("toko") TokoEntity toko, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT o FROM OrderEntity o JOIN o.items oi JOIN oi.product p WHERE p.toko = :toko AND o.orderStatus = :status")
    List<OrderEntity> findOrdersByTokoAndStatus(@Param("toko") TokoEntity toko, @Param("status") String status);
    
    @Query("SELECT o FROM OrderEntity o JOIN o.items oi JOIN oi.product p WHERE p.toko = :toko AND o.paymentStatus = :paymentStatus")
    List<OrderEntity> findOrdersByTokoAndPaymentStatus(@Param("toko") TokoEntity toko, @Param("paymentStatus") String paymentStatus);
    
    @Query("SELECT COUNT(DISTINCT o.user) FROM OrderEntity o JOIN o.items oi JOIN oi.product p WHERE p.toko = :toko")
    Long countDistinctCustomersByToko(@Param("toko") TokoEntity toko);
    
    @Query("SELECT COUNT(DISTINCT o.user) FROM OrderEntity o JOIN o.items oi JOIN oi.product p WHERE p.toko = :toko AND o.createdAt BETWEEN :startDate AND :endDate")
    Long countDistinctCustomersByTokoAndDateRange(@Param("toko") TokoEntity toko, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(o.total) FROM OrderEntity o JOIN o.items oi JOIN oi.product p WHERE p.toko = :toko AND o.paymentStatus = 'PAID'")
    Double sumTotalRevenueByToko(@Param("toko") TokoEntity toko);
    
    @Query("SELECT SUM(o.total) FROM OrderEntity o JOIN o.items oi JOIN oi.product p WHERE p.toko = :toko AND o.paymentStatus = 'PAID' AND o.createdAt BETWEEN :startDate AND :endDate")
    Double sumTotalRevenueByTokoAndDateRange(@Param("toko") TokoEntity toko, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(oi.quantity) FROM OrderEntity o JOIN o.items oi JOIN oi.product p WHERE p.toko = :toko AND o.paymentStatus = 'PAID'")
    Long sumTotalProductsSoldByToko(@Param("toko") TokoEntity toko);
    
    @Query("SELECT SUM(oi.quantity) FROM OrderEntity o JOIN o.items oi JOIN oi.product p WHERE p.toko = :toko AND o.paymentStatus = 'PAID' AND o.createdAt BETWEEN :startDate AND :endDate")
    Long sumTotalProductsSoldByTokoAndDateRange(@Param("toko") TokoEntity toko, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(o) FROM OrderEntity o JOIN o.items oi JOIN oi.product p WHERE p.toko = :toko AND o.orderStatus = :status")
    Long countOrdersByTokoAndStatus(@Param("toko") TokoEntity toko, @Param("status") String status);
}

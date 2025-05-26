package com.TryCatch.NusaCart.repository;

import com.TryCatch.NusaCart.entity.OrderEntity;
import com.TryCatch.NusaCart.entity.TrackingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackingRepository extends JpaRepository<TrackingEntity, Integer> {
    List<TrackingEntity> findByOrder(OrderEntity order);
}

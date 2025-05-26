package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.TrackingDTO;
import com.TryCatch.NusaCart.entity.OrderEntity;
import com.TryCatch.NusaCart.entity.TrackingEntity;
import com.TryCatch.NusaCart.repository.OrderRepository;
import com.TryCatch.NusaCart.repository.TrackingRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TrackingService {

    private final TrackingRepository trackingRepository;
    private final OrderRepository orderRepository;

    public void addTracking(Integer orderId, String status, String description) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        TrackingEntity tracking = TrackingEntity.builder()
                .order(order)
                .status(status)
                .description(description)
                .updatedAt(LocalDateTime.now())
                .build();

        trackingRepository.save(tracking);
    }

    public List<TrackingDTO> getTrackingByOrderId(Integer orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        return trackingRepository.findByOrder(order).stream()
                .map(t -> TrackingDTO.builder()
                        .trackingId(t.getTrackingId())
                        .status(t.getStatus())
                        .description(t.getDescription())
                        .updatedAt(t.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}

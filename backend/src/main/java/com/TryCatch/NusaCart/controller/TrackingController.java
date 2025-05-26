package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.TrackingDTO;
import com.TryCatch.NusaCart.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;

    @PostMapping("/{orderId}")
    public ResponseEntity<Map<String, String>> addTracking(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> request
    ) {
        String status = request.get("status");
        String description = request.get("description");

        trackingService.addTracking(orderId, status, description);
        return ResponseEntity.ok(Map.of("message", "Tracking info added"));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<List<TrackingDTO>> getTrackingByOrder(@PathVariable Integer orderId) {
        List<TrackingDTO> trackings = trackingService.getTrackingByOrderId(orderId);
        return ResponseEntity.ok(trackings);
    }
}

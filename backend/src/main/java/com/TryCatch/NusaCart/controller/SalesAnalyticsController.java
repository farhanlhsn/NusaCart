package com.TryCatch.NusaCart.controller;

import com.TryCatch.NusaCart.dto.SalesAnalyticsDTO;
import com.TryCatch.NusaCart.dto.SalesSummaryResponseDTO;
import com.TryCatch.NusaCart.service.SalesAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller/analytics")
@RequiredArgsConstructor
@Slf4j
public class SalesAnalyticsController {

    private final SalesAnalyticsService salesAnalyticsService;

    /**
     * Get comprehensive sales analytics for seller
     * 
     * @param period Predefined period: today, week, month, quarter, year
     * @param startDate Custom start date (YYYY-MM-DD format)
     * @param endDate Custom end date (YYYY-MM-DD format)
     * @param status Filter by order status: PROCESSING, SHIPPED, DELIVERED, CANCELLED
     * @param paymentStatus Filter by payment status: PENDING, PAID, FAILED, CANCELLED
     * @return Complete analytics data including charts, top products, categories, etc.
     */
    @GetMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SalesAnalyticsDTO> getFullAnalytics(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus) {
        
        log.info("Getting full analytics for seller with period: {}, startDate: {}, endDate: {}, status: {}, paymentStatus: {}", 
                period, startDate, endDate, status, paymentStatus);
        
        try {
            SalesAnalyticsDTO analytics = salesAnalyticsService.getFullAnalytics(
                    period, startDate, endDate, status, paymentStatus);
            return ResponseEntity.ok(analytics);
        } catch (RuntimeException e) {
            log.error("Error getting full analytics: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get sales summary for seller dashboard
     * 
     * @param period Predefined period: today, week, month, quarter, year
     * @param startDate Custom start date (YYYY-MM-DD format)
     * @param endDate Custom end date (YYYY-MM-DD format)
     * @return Summary data with key metrics
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SalesSummaryResponseDTO> getSummary(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        log.info("Getting sales summary for seller with period: {}, startDate: {}, endDate: {}", 
                period, startDate, endDate);
        
        try {
            SalesSummaryResponseDTO summary = salesAnalyticsService.getSummary(
                    period, startDate, endDate);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            log.error("Error getting sales summary: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Get analytics for specific time periods (helper endpoint)
     */
    @GetMapping("/quick/{period}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SalesSummaryResponseDTO> getQuickSummary(
            @PathVariable String period) {
        
        log.info("Getting quick summary for period: {}", period);
        
        try {
            SalesSummaryResponseDTO summary = salesAnalyticsService.getSummary(
                    period, null, null);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            log.error("Error getting quick summary: {}", e.getMessage());
            throw e;
        }
    }
}
package com.TryCatch.NusaCart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SalesSummaryResponseDTO {
    private Long totalOrders;
    private Double totalRevenue;
    private Long totalProductsSold;
    private Double averageOrderValue;
    private Long totalCustomers;
    private Long pendingOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    private Double growthRate; // percentage growth compared to previous period
    private String period; // e.g., "Last 30 days", "This month", etc.
}
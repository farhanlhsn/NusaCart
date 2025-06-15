package com.TryCatch.NusaCart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SalesAnalyticsDTO {
    private SalesSummaryDTO summary;
    private List<DailySalesDTO> dailySales;
    private List<ProductSalesDTO> topProducts;
    private List<CategorySalesDTO> categorySales;
    private List<MonthlySalesDTO> monthlySales;
    private Map<String, Long> orderStatusDistribution;
    private Map<String, Long> paymentStatusDistribution;
    private RevenueAnalyticsDTO revenueAnalytics;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class SalesSummaryDTO {
        private Long totalOrders;
        private Double totalRevenue;
        private Long totalProductsSold;
        private Double averageOrderValue;
        private Long totalCustomers;
        private Double growthRate; // percentage growth compared to previous period
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class DailySalesDTO {
        private String date; // YYYY-MM-DD format
        private Long orderCount;
        private Double revenue;
        private Long productsSold;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ProductSalesDTO {
        private Integer productId;
        private String productName;
        private Long quantitySold;
        private Double revenue;
        private String imageUrl;
        private Double price;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CategorySalesDTO {
        private String categoryName;
        private Long orderCount;
        private Double revenue;
        private Long productsSold;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class MonthlySalesDTO {
        private String month; // YYYY-MM format
        private Long orderCount;
        private Double revenue;
        private Long productsSold;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class RevenueAnalyticsDTO {
        private Double totalRevenue;
        private Double averageDailyRevenue;
        private Double highestDayRevenue;
        private Double lowestDayRevenue;
        private String bestPerformingDay;
        private String worstPerformingDay;
    }
}
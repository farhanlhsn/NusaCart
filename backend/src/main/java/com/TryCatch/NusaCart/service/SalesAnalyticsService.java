package com.TryCatch.NusaCart.service;

import com.TryCatch.NusaCart.dto.*;
import com.TryCatch.NusaCart.entity.*;
import com.TryCatch.NusaCart.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesAnalyticsService {

    private final OrderRepository orderRepository;
    private final TokoRepository tokoRepository;
    private final UserService userService;

    public SalesAnalyticsDTO getFullAnalytics(String period, String startDate, String endDate, String status, String paymentStatus) {
        UserEntity currentUser = userService.getCurrentUser();
        TokoEntity toko = getSellerToko(currentUser);
        
        LocalDateTime[] dateRange = parseDateRange(period, startDate, endDate);
        LocalDateTime start = dateRange[0];
        LocalDateTime end = dateRange[1];
        
        List<OrderEntity> orders = getFilteredOrders(toko, start, end, status, paymentStatus);
        
        return SalesAnalyticsDTO.builder()
                .summary(buildSummary(toko, start, end))
                .dailySales(buildDailySales(orders))
                .topProducts(buildTopProducts(orders))
                .categorySales(buildCategorySales(orders))
                .monthlySales(buildMonthlySales(orders))
                .orderStatusDistribution(buildOrderStatusDistribution(toko, start, end))
                .paymentStatusDistribution(buildPaymentStatusDistribution(toko, start, end))
                .revenueAnalytics(buildRevenueAnalytics(orders))
                .build();
    }

    public SalesSummaryResponseDTO getSummary(String period, String startDate, String endDate) {
        UserEntity currentUser = userService.getCurrentUser();
        TokoEntity toko = getSellerToko(currentUser);
        
        LocalDateTime[] dateRange = parseDateRange(period, startDate, endDate);
        LocalDateTime start = dateRange[0];
        LocalDateTime end = dateRange[1];
        
        List<OrderEntity> orders = orderRepository.findOrdersByTokoAndDateRange(toko, start, end);
        List<OrderEntity> paidOrders = orders.stream()
                .filter(o -> "PAID".equals(o.getPaymentStatus()))
                .collect(Collectors.toList());
        
        Double totalRevenue = orderRepository.sumTotalRevenueByTokoAndDateRange(toko, start, end);
        if (totalRevenue == null) totalRevenue = 0.0;
        
        Long totalProductsSold = orderRepository.sumTotalProductsSoldByTokoAndDateRange(toko, start, end);
        if (totalProductsSold == null) totalProductsSold = 0L;
        
        Long totalCustomers = orderRepository.countDistinctCustomersByTokoAndDateRange(toko, start, end);
        if (totalCustomers == null) totalCustomers = 0L;
        
        Double averageOrderValue = paidOrders.isEmpty() ? 0.0 : totalRevenue / paidOrders.size();
        
        Long pendingOrders = orderRepository.countOrdersByTokoAndStatus(toko, "PROCESSING");
        Long completedOrders = orderRepository.countOrdersByTokoAndStatus(toko, "DELIVERED");
        Long cancelledOrders = orderRepository.countOrdersByTokoAndStatus(toko, "CANCELLED");
        
        // Calculate growth rate (compare with previous period)
        Double growthRate = calculateGrowthRate(toko, start, end);
        
        return SalesSummaryResponseDTO.builder()
                .totalOrders((long) paidOrders.size())
                .totalRevenue(totalRevenue)
                .totalProductsSold(totalProductsSold)
                .averageOrderValue(averageOrderValue)
                .totalCustomers(totalCustomers)
                .pendingOrders(pendingOrders != null ? pendingOrders : 0L)
                .completedOrders(completedOrders != null ? completedOrders : 0L)
                .cancelledOrders(cancelledOrders != null ? cancelledOrders : 0L)
                .growthRate(growthRate)
                .period(formatPeriod(period, start, end))
                .build();
    }

    private TokoEntity getSellerToko(UserEntity seller) {
        List<TokoEntity> tokos = tokoRepository.findBySeller(seller);
        if (tokos.isEmpty()) {
            throw new RuntimeException("Seller does not have any store");
        }
        return tokos.get(0); // Assuming one seller has one store
    }

    private LocalDateTime[] parseDateRange(String period, String startDate, String endDate) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start;
        
        if (startDate != null && endDate != null) {
            start = LocalDateTime.parse(startDate + "T00:00:00");
            end = LocalDateTime.parse(endDate + "T23:59:59");
        } else if (period != null) {
            switch (period.toLowerCase()) {
                case "today":
                    start = end.toLocalDate().atStartOfDay();
                    break;
                case "week":
                    start = end.minusWeeks(1);
                    break;
                case "month":
                    start = end.minusMonths(1);
                    break;
                case "quarter":
                    start = end.minusMonths(3);
                    break;
                case "year":
                    start = end.minusYears(1);
                    break;
                default:
                    start = end.minusMonths(1); // Default to last month
            }
        } else {
            start = end.minusMonths(1); // Default to last month
        }
        
        return new LocalDateTime[]{start, end};
    }

    private List<OrderEntity> getFilteredOrders(TokoEntity toko, LocalDateTime start, LocalDateTime end, String status, String paymentStatus) {
        List<OrderEntity> orders = orderRepository.findOrdersByTokoAndDateRange(toko, start, end);
        
        if (status != null && !status.isEmpty()) {
            orders = orders.stream()
                    .filter(o -> status.equals(o.getOrderStatus()))
                    .collect(Collectors.toList());
        }
        
        if (paymentStatus != null && !paymentStatus.isEmpty()) {
            orders = orders.stream()
                    .filter(o -> paymentStatus.equals(o.getPaymentStatus()))
                    .collect(Collectors.toList());
        }
        
        return orders;
    }

    private SalesAnalyticsDTO.SalesSummaryDTO buildSummary(TokoEntity toko, LocalDateTime start, LocalDateTime end) {
        List<OrderEntity> orders = orderRepository.findOrdersByTokoAndDateRange(toko, start, end);
        List<OrderEntity> paidOrders = orders.stream()
                .filter(o -> "PAID".equals(o.getPaymentStatus()))
                .collect(Collectors.toList());
        
        Double totalRevenue = paidOrders.stream().mapToDouble(OrderEntity::getTotal).sum();
        Long totalProductsSold = paidOrders.stream()
                .flatMap(o -> o.getItems().stream())
                .mapToLong(OrderItemEntity::getQuantity)
                .sum();
        
        Long totalCustomers = orderRepository.countDistinctCustomersByTokoAndDateRange(toko, start, end);
        Double averageOrderValue = paidOrders.isEmpty() ? 0.0 : totalRevenue / paidOrders.size();
        Double growthRate = calculateGrowthRate(toko, start, end);
        
        return SalesAnalyticsDTO.SalesSummaryDTO.builder()
                .totalOrders((long) paidOrders.size())
                .totalRevenue(totalRevenue)
                .totalProductsSold(totalProductsSold)
                .averageOrderValue(averageOrderValue)
                .totalCustomers(totalCustomers != null ? totalCustomers : 0L)
                .growthRate(growthRate)
                .build();
    }

    private List<SalesAnalyticsDTO.DailySalesDTO> buildDailySales(List<OrderEntity> orders) {
        Map<String, List<OrderEntity>> dailyOrders = orders.stream()
                .filter(o -> "PAID".equals(o.getPaymentStatus()))
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().toLocalDate().toString()));
        
        return dailyOrders.entrySet().stream()
                .map(entry -> {
                    List<OrderEntity> dayOrders = entry.getValue();
                    Double revenue = dayOrders.stream().mapToDouble(OrderEntity::getTotal).sum();
                    Long productsSold = dayOrders.stream()
                            .flatMap(o -> o.getItems().stream())
                            .mapToLong(OrderItemEntity::getQuantity)
                            .sum();
                    
                    return SalesAnalyticsDTO.DailySalesDTO.builder()
                            .date(entry.getKey())
                            .orderCount((long) dayOrders.size())
                            .revenue(revenue)
                            .productsSold(productsSold)
                            .build();
                })
                .sorted(Comparator.comparing(SalesAnalyticsDTO.DailySalesDTO::getDate))
                .collect(Collectors.toList());
    }

    private List<SalesAnalyticsDTO.ProductSalesDTO> buildTopProducts(List<OrderEntity> orders) {
        Map<ProductEntity, List<OrderItemEntity>> productSales = orders.stream()
                .filter(o -> "PAID".equals(o.getPaymentStatus()))
                .flatMap(o -> o.getItems().stream())
                .collect(Collectors.groupingBy(OrderItemEntity::getProduct));
        
        return productSales.entrySet().stream()
                .map(entry -> {
                    ProductEntity product = entry.getKey();
                    List<OrderItemEntity> items = entry.getValue();
                    Long quantitySold = items.stream().mapToLong(OrderItemEntity::getQuantity).sum();
                    Double revenue = items.stream().mapToDouble(OrderItemEntity::getPrice).sum();
                    
                    return SalesAnalyticsDTO.ProductSalesDTO.builder()
                            .productId(product.getProductId())
                            .productName(product.getProductName())
                            .quantitySold(quantitySold)
                            .revenue(revenue)
                            .imageUrl(product.getImageUrls() != null && !product.getImageUrls().isEmpty() ? 
                                    product.getImageUrls().get(0) : null)
                            .price(product.getPrice())
                            .build();
                })
                .sorted(Comparator.comparing(SalesAnalyticsDTO.ProductSalesDTO::getQuantitySold).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<SalesAnalyticsDTO.CategorySalesDTO> buildCategorySales(List<OrderEntity> orders) {
        Map<String, List<OrderItemEntity>> categorySales = orders.stream()
                .filter(o -> "PAID".equals(o.getPaymentStatus()))
                .flatMap(o -> o.getItems().stream())
                .collect(Collectors.groupingBy(item -> {
                    CategoryEntity category = item.getProduct().getCategory();
                    return category != null ? category.getNamaCategory() : "Uncategorized";
                }));
        
        return categorySales.entrySet().stream()
                .map(entry -> {
                    String categoryName = entry.getKey();
                    List<OrderItemEntity> items = entry.getValue();
                    Long productsSold = items.stream().mapToLong(OrderItemEntity::getQuantity).sum();
                    Double revenue = items.stream().mapToDouble(OrderItemEntity::getPrice).sum();
                    
                    return SalesAnalyticsDTO.CategorySalesDTO.builder()
                            .categoryName(categoryName)
                            .orderCount((long) items.size())
                            .revenue(revenue)
                            .productsSold(productsSold)
                            .build();
                })
                .sorted(Comparator.comparing(SalesAnalyticsDTO.CategorySalesDTO::getRevenue).reversed())
                .collect(Collectors.toList());
    }

    private List<SalesAnalyticsDTO.MonthlySalesDTO> buildMonthlySales(List<OrderEntity> orders) {
        Map<String, List<OrderEntity>> monthlySales = orders.stream()
                .filter(o -> "PAID".equals(o.getPaymentStatus()))
                .collect(Collectors.groupingBy(o -> 
                        o.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM"))));
        
        return monthlySales.entrySet().stream()
                .map(entry -> {
                    List<OrderEntity> monthOrders = entry.getValue();
                    Double revenue = monthOrders.stream().mapToDouble(OrderEntity::getTotal).sum();
                    Long productsSold = monthOrders.stream()
                            .flatMap(o -> o.getItems().stream())
                            .mapToLong(OrderItemEntity::getQuantity)
                            .sum();
                    
                    return SalesAnalyticsDTO.MonthlySalesDTO.builder()
                            .month(entry.getKey())
                            .orderCount((long) monthOrders.size())
                            .revenue(revenue)
                            .productsSold(productsSold)
                            .build();
                })
                .sorted(Comparator.comparing(SalesAnalyticsDTO.MonthlySalesDTO::getMonth))
                .collect(Collectors.toList());
    }

    private Map<String, Long> buildOrderStatusDistribution(TokoEntity toko, LocalDateTime start, LocalDateTime end) {
        List<OrderEntity> orders = orderRepository.findOrdersByTokoAndDateRange(toko, start, end);
        
        return orders.stream()
                .collect(Collectors.groupingBy(
                        OrderEntity::getOrderStatus,
                        Collectors.counting()
                ));
    }

    private Map<String, Long> buildPaymentStatusDistribution(TokoEntity toko, LocalDateTime start, LocalDateTime end) {
        List<OrderEntity> orders = orderRepository.findOrdersByTokoAndDateRange(toko, start, end);
        
        return orders.stream()
                .collect(Collectors.groupingBy(
                        OrderEntity::getPaymentStatus,
                        Collectors.counting()
                ));
    }

    private SalesAnalyticsDTO.RevenueAnalyticsDTO buildRevenueAnalytics(List<OrderEntity> orders) {
        List<OrderEntity> paidOrders = orders.stream()
                .filter(o -> "PAID".equals(o.getPaymentStatus()))
                .collect(Collectors.toList());
        
        if (paidOrders.isEmpty()) {
            return SalesAnalyticsDTO.RevenueAnalyticsDTO.builder()
                    .totalRevenue(0.0)
                    .averageDailyRevenue(0.0)
                    .highestDayRevenue(0.0)
                    .lowestDayRevenue(0.0)
                    .bestPerformingDay("N/A")
                    .worstPerformingDay("N/A")
                    .build();
        }
        
        Double totalRevenue = paidOrders.stream().mapToDouble(OrderEntity::getTotal).sum();
        
        Map<String, Double> dailyRevenue = paidOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().toLocalDate().toString(),
                        Collectors.summingDouble(OrderEntity::getTotal)
                ));
        
        Double averageDailyRevenue = dailyRevenue.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
        
        Optional<Map.Entry<String, Double>> bestDay = dailyRevenue.entrySet().stream()
                .max(Map.Entry.comparingByValue());
        
        Optional<Map.Entry<String, Double>> worstDay = dailyRevenue.entrySet().stream()
                .min(Map.Entry.comparingByValue());
        
        return SalesAnalyticsDTO.RevenueAnalyticsDTO.builder()
                .totalRevenue(totalRevenue)
                .averageDailyRevenue(averageDailyRevenue)
                .highestDayRevenue(bestDay.map(Map.Entry::getValue).orElse(0.0))
                .lowestDayRevenue(worstDay.map(Map.Entry::getValue).orElse(0.0))
                .bestPerformingDay(bestDay.map(Map.Entry::getKey).orElse("N/A"))
                .worstPerformingDay(worstDay.map(Map.Entry::getKey).orElse("N/A"))
                .build();
    }

    private Double calculateGrowthRate(TokoEntity toko, LocalDateTime start, LocalDateTime end) {
        try {
            // Calculate previous period
            long periodDays = java.time.Duration.between(start, end).toDays();
            LocalDateTime prevStart = start.minusDays(periodDays);
            LocalDateTime prevEnd = start;
            
            Double currentRevenue = orderRepository.sumTotalRevenueByTokoAndDateRange(toko, start, end);
            Double previousRevenue = orderRepository.sumTotalRevenueByTokoAndDateRange(toko, prevStart, prevEnd);
            
            if (currentRevenue == null) currentRevenue = 0.0;
            if (previousRevenue == null || previousRevenue == 0.0) return 0.0;
            
            return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
        } catch (Exception e) {
            log.warn("Error calculating growth rate: {}", e.getMessage());
            return 0.0;
        }
    }

    private String formatPeriod(String period, LocalDateTime start, LocalDateTime end) {
        if (period != null) {
            switch (period.toLowerCase()) {
                case "today": return "Today";
                case "week": return "Last 7 days";
                case "month": return "Last 30 days";
                case "quarter": return "Last 3 months";
                case "year": return "Last 12 months";
            }
        }
        return start.toLocalDate() + " to " + end.toLocalDate();
    }
}
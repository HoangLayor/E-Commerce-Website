package com.tuongchinh.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalCustomers;
    private long totalProducts;
    
    private List<DailyRevenue> revenueChart;
    private List<CategorySales> categoryChart;
    private List<TopProduct> topProducts;
    private List<OrderStatusDistribution> statusChart;
    private List<BrandSales> brandChart;

    @Data
    @AllArgsConstructor
    public static class OrderStatusDistribution {
        private String status;
        private long count;
        private String color;
    }

    @Data
    @AllArgsConstructor
    public static class BrandSales {
        private String name;
        private double value; // Percentage
        private String color;
    }

    @Data
    @AllArgsConstructor
    public static class DailyRevenue {
        private String date;
        private BigDecimal revenue;
        private long orders;
    }

    @Data
    @AllArgsConstructor
    public static class CategorySales {
        private String name;
        private double value; // Percentage
        private String color;
    }

    @Data
    @AllArgsConstructor
    public static class TopProduct {
        private String name;
        private long sales;
        private BigDecimal revenue;
        private double growth;
    }
}

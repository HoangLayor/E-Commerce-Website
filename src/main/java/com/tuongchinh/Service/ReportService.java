package com.tuongchinh.Service;

import com.tuongchinh.DTO.ReportResponse;
import com.tuongchinh.Entity.Order;
import com.tuongchinh.Entity.OrderItem;
import com.tuongchinh.Repository.OrderRepository;
import com.tuongchinh.Repository.ProductRepository;
import com.tuongchinh.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public ReportResponse getSummaryReport() {
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();

        BigDecimal totalRevenue = orders.stream()
                .filter(o -> "DELIVERED".equalsIgnoreCase(o.getOrderStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orders.size();
        long totalCustomers = userRepository.countByRole("USER");
        long totalProducts = productRepository.count();

        // Calculate real revenue data for the last 7 days
        List<ReportResponse.DailyRevenue> revenueChart = calculateDailyRevenue(orders);

        // Calculate real revenue structure by category
        List<ReportResponse.CategorySales> categoryChart = calculateCategorySales(orders, totalRevenue);

        List<ReportResponse.TopProduct> topProducts = calculateTopProducts(orders);

        List<ReportResponse.OrderStatusDistribution> statusChart = calculateOrderStatusDistribution(orders);

        List<ReportResponse.BrandSales> brandChart = calculateBrandSales(orders);

        return ReportResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .revenueChart(revenueChart)
                .categoryChart(categoryChart)
                .topProducts(topProducts)
                .statusChart(statusChart)
                .brandChart(brandChart)
                .build();
    }

    private List<ReportResponse.DailyRevenue> calculateDailyRevenue(List<Order> orders) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        Map<String, BigDecimal> dailyRev = new HashMap<>();
        Map<String, Long> dailyOrders = new HashMap<>();

        // Group orders by formatted date
        orders.stream()
                .filter(o -> o != null && "DELIVERED".equalsIgnoreCase(o.getOrderStatus()))
                .forEach(o -> {
                    LocalDateTime date = o.getOrderDate() != null ? o.getOrderDate() : o.getCreatedAt();
                    if (date != null) {
                        String dateStr = date.format(formatter);
                        BigDecimal amount = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                        dailyRev.put(dateStr, dailyRev.getOrDefault(dateStr, BigDecimal.ZERO).add(amount));
                        dailyOrders.put(dateStr, dailyOrders.getOrDefault(dateStr, 0L) + 1);
                    }
                });

        // Ensure chart shows the last 7 days in chronological order
        List<ReportResponse.DailyRevenue> chart = new ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        for (int i = 6; i >= 0; i--) {
            String dateLabel = now.minusDays(i).format(formatter);
            BigDecimal rev = dailyRev.getOrDefault(dateLabel, BigDecimal.ZERO);
            long orderCount = dailyOrders.getOrDefault(dateLabel, 0L);
            chart.add(new ReportResponse.DailyRevenue(dateLabel, rev, orderCount));
        }

        return chart;
    }

    private List<ReportResponse.CategorySales> calculateCategorySales(List<Order> orders, BigDecimal totalRevenue) {
        Map<String, BigDecimal> revByCategory = new HashMap<>();

        for (Order order : orders) {
            if (!"DELIVERED".equalsIgnoreCase(order.getOrderStatus()))
                continue;
            for (OrderItem item : order.getItems()) {
                String catName = "Khác";
                if (item.getVariant() != null &&
                        item.getVariant().getProduct() != null &&
                        item.getVariant().getProduct().getCategory() != null) {
                    catName = item.getVariant().getProduct().getCategory().getName();
                }

                BigDecimal itemSubtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                revByCategory.put(catName, revByCategory.getOrDefault(catName, BigDecimal.ZERO).add(itemSubtotal));
            }
        }

        BigDecimal sumOfCategoryRevenues = revByCategory.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (sumOfCategoryRevenues.compareTo(BigDecimal.ZERO) == 0) {
            return Collections.emptyList();
        }

        String[] colors = { "#B76E79", "#E8D5C4", "#4CAF50", "#2196F3", "#9C27B0", "#FF9800" };
        final int[] colorIdx = { 0 };

        return revByCategory.entrySet().stream()
                .map(e -> {
                    double percentage = e.getValue()
                            .multiply(BigDecimal.valueOf(100))
                            .divide(sumOfCategoryRevenues, 2, java.math.RoundingMode.HALF_UP)
                            .doubleValue();
                    String color = colors[colorIdx[0] % colors.length];
                    colorIdx[0]++;
                    return new ReportResponse.CategorySales(e.getKey(), percentage, color);
                })
                .sorted(Comparator.comparing(ReportResponse.CategorySales::getValue).reversed())
                .collect(Collectors.toList());
    }

    private List<ReportResponse.TopProduct> calculateTopProducts(List<Order> orders) {
        Map<String, Long> productSales = new HashMap<>();
        Map<String, BigDecimal> productRevenue = new HashMap<>();

        for (Order order : orders) {
            if (!"DELIVERED".equalsIgnoreCase(order.getOrderStatus()))
                continue;
            for (OrderItem item : order.getItems()) {
                String name = item.getVariant().getProduct().getName();
                productSales.put(name, productSales.getOrDefault(name, 0L) + item.getQuantity());
                productRevenue.put(name, productRevenue.getOrDefault(name, BigDecimal.ZERO)
                        .add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))));
            }
        }

        return productSales.entrySet().stream()
                .map(e -> new ReportResponse.TopProduct(e.getKey(), e.getValue(), productRevenue.get(e.getKey()), 0.0))
                .sorted(Comparator.comparing(ReportResponse.TopProduct::getSales).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<ReportResponse.OrderStatusDistribution> calculateOrderStatusDistribution(List<Order> orders) {
        Map<String, Long> counts = orders.stream()
                .collect(Collectors.groupingBy(Order::getOrderStatus, Collectors.counting()));

        Map<String, String> statusColors = Map.of(
                "PENDING", "#9E9E9E",
                "PROCESSING", "#2196F3",
                "SHIPPED", "#FF9800",
                "DELIVERED", "#4CAF50",
                "CANCELLED", "#F44336");

        return counts.entrySet().stream()
                .map(e -> new ReportResponse.OrderStatusDistribution(
                        e.getKey(),
                        e.getValue(),
                        statusColors.getOrDefault(e.getKey(), "#000000")))
                .collect(Collectors.toList());
    }

    private List<ReportResponse.BrandSales> calculateBrandSales(List<Order> orders) {
        Map<String, BigDecimal> revByBrand = new HashMap<>();

        for (Order order : orders) {
            if (!"DELIVERED".equalsIgnoreCase(order.getOrderStatus()))
                continue;
            for (OrderItem item : order.getItems()) {
                String brandName = "Khác";
                if (item.getVariant() != null &&
                        item.getVariant().getProduct() != null &&
                        item.getVariant().getProduct().getBrand() != null) {
                    brandName = item.getVariant().getProduct().getBrand().getName();
                }

                BigDecimal itemSubtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                revByBrand.put(brandName, revByBrand.getOrDefault(brandName, BigDecimal.ZERO).add(itemSubtotal));
            }
        }

        BigDecimal total = revByBrand.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        if (total.compareTo(BigDecimal.ZERO) == 0)
            return Collections.emptyList();

        String[] colors = { "#4BC0C0", "#36A2EB", "#FF6384", "#FFCE56", "#9966FF", "#C9CBCF" };
        final int[] idx = { 0 };

        return revByBrand.entrySet().stream()
                .map(e -> {
                    double pct = e.getValue().multiply(BigDecimal.valueOf(100))
                            .divide(total, 2, java.math.RoundingMode.HALF_UP).doubleValue();
                    return new ReportResponse.BrandSales(e.getKey(), pct, colors[idx[0]++ % colors.length]);
                })
                .sorted(Comparator.comparing(ReportResponse.BrandSales::getValue).reversed())
                .collect(Collectors.toList());
    }
}

package com.tuongchinh.Entity;

import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filter(
            String keyword,
            Double minPrice,
            Double maxPrice,
            List<Long> categoryIds,
            List<Long> brandIds,
            Boolean inStock,
            List<Long> attributeValueIds) {

        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            // Tìm theo tên
            if (keyword != null && !keyword.trim().isEmpty()) {
                predicate = cb.and(predicate,
                        cb.like(
                                cb.lower(root.get("name")),
                                "%" + keyword.toLowerCase() + "%"
                        )
                );
            }

            // Lọc theo danh mục (chấp nhận nhiều ID)
            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicate = cb.and(predicate,
                        root.get("category").get("id").in(categoryIds)
                );
            }

            // Lọc theo thương hiệu (chấp nhận nhiều ID)
            if (brandIds != null && !brandIds.isEmpty()) {
                predicate = cb.and(predicate,
                        root.get("brand").get("id").in(brandIds)
                );
            }

            // Lọc theo thuộc tính (Ví dụ: Loại da - chấp nhận nhiều ID)
            if (attributeValueIds != null && !attributeValueIds.isEmpty()) {
                Subquery<Long> attrQuery = query.subquery(Long.class);
                Root<ProductVariant> variantRoot = attrQuery.from(ProductVariant.class);
                Join<ProductVariant, AttributeValue> attrValues = variantRoot.join("attributeValues");
                
                attrQuery.select(variantRoot.get("product").get("id"))
                        .where(
                                attrValues.get("id").in(attributeValueIds),
                                cb.isTrue(variantRoot.get("isActive"))
                        );
                
                predicate = cb.and(predicate, root.get("id").in(attrQuery));
            }

            // Lọc theo giá (min và max) — kiểm tra nếu có ANY variant nào có giá nằm trong khoảng
            if (minPrice != null || maxPrice != null) {
                Subquery<Long> priceQuery = query.subquery(Long.class);
                Root<ProductVariant> priceRoot = priceQuery.from(ProductVariant.class);
                
                // Effective Price = coalesce(discountPrice, price)
                Expression<BigDecimal> effectivePrice = cb.coalesce(
                    priceRoot.get("discountPrice"), 
                    priceRoot.get("price")
                );

                Predicate pricePredicate = cb.and(
                    cb.equal(priceRoot.get("product"), root),
                    cb.isTrue(priceRoot.get("isActive"))
                );

                if (minPrice != null) {
                    pricePredicate = cb.and(pricePredicate, 
                        cb.greaterThanOrEqualTo(effectivePrice, BigDecimal.valueOf(minPrice)));
                }
                if (maxPrice != null) {
                    pricePredicate = cb.and(pricePredicate, 
                        cb.lessThanOrEqualTo(effectivePrice, BigDecimal.valueOf(maxPrice)));
                }

                priceQuery.select(priceRoot.get("id")).where(pricePredicate);
                predicate = cb.and(predicate, cb.exists(priceQuery));
            }

            // Lọc chỉ còn hàng
            if (Boolean.TRUE.equals(inStock)) {
                Subquery<Integer> stockQuery = query.subquery(Integer.class);
                Root<ProductVariant> variantRoot = stockQuery.from(ProductVariant.class);
                stockQuery
                        .select(cb.sum(variantRoot.get("stock")))
                        .where(
                                cb.equal(variantRoot.get("product"), root),
                                cb.isTrue(variantRoot.get("isActive"))
                        );
                predicate = cb.and(predicate,
                        cb.greaterThan(stockQuery, 0)
                );
            }

            // Tránh duplicate khi JOIN
            query.distinct(true);

            return predicate;
        };
    }
}
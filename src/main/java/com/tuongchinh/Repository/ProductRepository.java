package com.tuongchinh.Repository;

import com.tuongchinh.Entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // JOIN FETCH category trong 1 query → fix N+1 khi lấy danh sách sản phẩm
    @Override
    @EntityGraph(attributePaths = {"category", "brand"})
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);

    // JOIN FETCH category khi lấy product theo ID
    @Override
    @EntityGraph(attributePaths = {"category", "brand"})
    Optional<Product> findById(Long id);
    List<Product> findByCategoryId(Long categoryId);
    long countByCategoryId(Long categoryId);
    List<Product> findAllByOrderByCreatedAtDesc(Pageable pageable);
    @Query("""
    SELECT DISTINCT p FROM Product p
    JOIN ProductVariant pv ON pv.product = p
    WHERE pv.isActive = true
    AND pv.discountPrice IS NOT NULL
    AND pv.discountPrice < pv.price
    """)
    Page<Product> findSaleProducts(Pageable pageable);
    @Query("""
    SELECT DISTINCT p FROM Product p
    JOIN ProductVariant pv ON pv.product = p
    WHERE pv.isActive = true
    AND pv.discountPrice IS NOT NULL
    AND pv.discountPrice < pv.price
    ORDER BY p.totalSold DESC
    """)
    Page<Product> findFlashSales(Pageable pageable);

    @Query("""
    SELECT p
    FROM Product p
    WHERE p.totalSold > 0
    ORDER BY p.totalSold DESC
    """)
    Page<Product> findBestSelling(Pageable pageable);
    
    Page<Product> findAllByOrderByTotalSoldDesc(Pageable pageable);
}

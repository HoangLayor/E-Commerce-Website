package com.tuongchinh.Service;

import com.tuongchinh.DTO.*;
import com.tuongchinh.Entity.*;
import com.tuongchinh.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository productImageRepository;
    private final CloudinaryService cloudinaryService;
    private final AttributeValueRepository attributeValueRepository;
    private final CategoryService categoryService;

    public Page<ProductResponse> searchProducts(
            String keyword, Double minPrice, Double maxPrice,
            List<Long> categoryIds, List<Long> brandIds, Boolean inStock,
            List<Long> attributeValueIds,
            int page, int size, String sortBy, String sortDir) {

        // Mở rộng categoryIds để bao gồm cả các danh mục con
        List<Long> allCategoryIds = (categoryIds != null && !categoryIds.isEmpty())
                ? categoryService.getCategoryIdsWithChildren(categoryIds)
                : null;

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<Product> products = productRepository.findAll(
                ProductSpecification.filter(keyword, minPrice, maxPrice, allCategoryIds, brandIds, inStock,
                        attributeValueIds),
                PageRequest.of(page, size, sort));

        // Convert Page<Product> → Page<ProductResponse>
        return products.map(product -> {
            List<ProductVariant> variants = product.getVariants().stream()
                    .filter(ProductVariant::getIsActive)
                    .collect(Collectors.toList());
            List<String> images = product.getImages().stream()
                    .map(ProductImage::getUrl)
                    .collect(Collectors.toList());
            return mapToResponse(product, variants, images);
        });
    }

    public ProductResponse getProductDetail(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm: " + id));

        List<ProductVariant> variants = product.getVariants().stream()
                .filter(ProductVariant::getIsActive)
                .collect(Collectors.toList());
        List<String> images = product.getImages().stream()
                .map(ProductImage::getUrl)
                .collect(Collectors.toList());

        return mapToResponse(product, variants, images);
    }

    public ProductResponse create(ProductRequest request, List<MultipartFile> images) {
        checkTestCase(request);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + request.getCategoryId()));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu: " + request.getBrandId()));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBrand(brand);
        productRepository.save(product);

        if (images != null) {
            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    ProductImage img = new ProductImage();
                    img.setProduct(product);
                    img.setUrl(cloudinaryService.uploadImage(file));
                    productImageRepository.save(img);
                }
            }
        }

        if (request.getVariants() != null) {
            for (ProductRequest.VariantRequest vr : request.getVariants()) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(product);
                variant.setSku(vr.getSku());

                // Validate giá trước khi gán
                validatePrices(vr);

                variant.setPrice(vr.getPrice());
                variant.setDiscountPrice(vr.getDiscountPrice());
                // Nếu không có compareAtPrice thì lấy từ price (Giá gốc)
                variant.setCompareAtPrice(vr.getCompareAtPrice() != null ? vr.getCompareAtPrice() : vr.getPrice());
                variant.setCostPrice(vr.getCostPrice());
                variant.setStock(vr.getStock());
                variant.setImageUrl(vr.getImageUrl());
                variant.setIsActive(true);

                if (vr.getAttributeValueIds() != null && !vr.getAttributeValueIds().isEmpty()) {
                    List<AttributeValue> attributeValues = attributeValueRepository
                            .findAllById(vr.getAttributeValueIds());
                    variant.setAttributeValues(attributeValues);
                }

                variantRepository.save(variant);
            }
        }

        return mapToResponse(product,
                variantRepository.findByProductIdAndIsActiveTrue(product.getId()),
                productImageRepository.findUrlsByProductId(product.getId()));
    }

    public ProductResponse update(Long id, ProductRequest request, List<MultipartFile> images) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + request.getCategoryId()));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu: " + request.getBrandId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setBrand(brand);
        productRepository.save(product);

        if (images != null) {
            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    ProductImage img = new ProductImage();
                    img.setProduct(product);
                    img.setUrl(cloudinaryService.uploadImage(file));
                    productImageRepository.save(img);
                }
            }
        }

        if (request.getVariants() != null) {
            List<ProductVariant> currentVariants = variantRepository.findByProductId(id);
            java.util.Set<Long> updatedIds = new java.util.HashSet<>();

            for (ProductRequest.VariantRequest vr : request.getVariants()) {
                ProductVariant variant;
                if (vr.getId() != null) {
                    variant = currentVariants.stream()
                            .filter(v -> v.getId().equals(vr.getId()))
                            .findFirst()
                            .orElse(new ProductVariant()); // Fallback if ID is invalid
                    updatedIds.add(vr.getId());
                } else {
                    variant = new ProductVariant();
                }

                variant.setProduct(product);
                variant.setSku(vr.getSku());

                // Validate giá trước khi gán
                validatePrices(vr);

                variant.setDiscountPrice(vr.getDiscountPrice());
                // Sửa logic: Lấy từ request chứ không ép bằng price
                variant.setCompareAtPrice(vr.getCompareAtPrice() != null ? vr.getCompareAtPrice() : vr.getPrice());
                variant.setPrice(vr.getPrice());
                variant.setCostPrice(vr.getCostPrice());
                variant.setStock(vr.getStock());
                variant.setImageUrl(vr.getImageUrl());
                variant.setIsActive(true);

                if (vr.getAttributeValueIds() != null && !vr.getAttributeValueIds().isEmpty()) {
                    List<AttributeValue> attributeValues = attributeValueRepository
                            .findAllById(vr.getAttributeValueIds());
                    variant.setAttributeValues(attributeValues);
                }

                variantRepository.save(variant);
            }

            // Mark variants not in request as inactive
            for (ProductVariant old : currentVariants) {
                if (!updatedIds.contains(old.getId())) {
                    old.setIsActive(false);
                    variantRepository.save(old);
                }
            }
        }

        return mapToResponse(product,
                variantRepository.findByProductIdAndIsActiveTrue(id),
                productImageRepository.findUrlsByProductId(id));
    }

    public void delete(Long id) {
        try {
            productRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Không thể xóa sản phẩm do có dữ liệu liên quan (ví dụ: đơn hàng). Vui lòng ẩn sản phẩm thay vì xóa.");
        }
    }

    public List<ProductResponse> getProductsByCategoryId(Long categoryId) {
        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(product -> {
                    List<ProductVariant> variants = product.getVariants().stream()
                            .filter(ProductVariant::getIsActive)
                            .collect(Collectors.toList());
                    List<String> images = product.getImages().stream()
                            .map(ProductImage::getUrl)
                            .collect(Collectors.toList());
                    return mapToResponse(product, variants, images);
                })
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getNewProducts(int limit) {
        return productRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit))
                .stream()
                .map(product -> {
                    List<ProductVariant> variants = product.getVariants().stream()
                            .filter(ProductVariant::getIsActive)
                            .collect(Collectors.toList());
                    List<String> images = product.getImages().stream()
                            .map(ProductImage::getUrl)
                            .collect(Collectors.toList());
                    return mapToResponse(product, variants, images);
                })
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getFlashSale(int limit) {
        Page<Product> products = productRepository.findFlashSales(PageRequest.of(0, limit));
        return products.stream()
                .map(product -> {
                    List<ProductVariant> variants = product.getVariants().stream()
                            .filter(ProductVariant::getIsActive)
                            .collect(Collectors.toList());
                    List<String> images = product.getImages().stream()
                            .map(ProductImage::getUrl)
                            .collect(Collectors.toList());
                    return mapToResponse(product, variants, images);
                })
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getBestSelling(int limit) {

        Page<Product> products = productRepository.findBestSelling(
                PageRequest.of(0, limit));
        return products.map(product -> {

            // lọc variant active
            List<ProductVariant> variants = product.getVariants().stream()
                    .filter(ProductVariant::getIsActive)
                    .collect(Collectors.toList());

            // lấy danh sách ảnh
            List<String> images = product.getImages().stream()
                    .map(ProductImage::getUrl)
                    .collect(Collectors.toList());

            return mapToResponse(product, variants, images);

        }).getContent();
    }

    private ProductResponse mapToResponse(Product product, List<ProductVariant> variants, List<String> images) {
        BigDecimal priceMin = variants.stream()
                .map(ProductVariant::getEffectivePrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        ProductResponse res = new ProductResponse();
        res.setId(product.getId());
        res.setName(product.getName());
        res.setDescription(product.getDescription());
        res.setCategoryId(product.getCategory().getId());
        res.setCategoryName(product.getCategory().getName());
        res.setBrandId(product.getBrand() != null ? product.getBrand().getId() : null);
        res.setBrandName(product.getBrand() != null ? product.getBrand().getName() : null);
        res.setThumbnail(images.isEmpty() ? null : images.get(0));
        res.setImages(images);
        res.setPriceMin(priceMin);
        res.setVariants(variants.stream().map(this::mapVariant).collect(Collectors.toList()));
        res.setAverageRating(product.getAverageRating());
        res.setTotalReviews(product.getTotalReviews());
        res.setTotalSold(product.getTotalSold());
        res.setCreatedAt(product.getCreatedAt());
        return res;
    }

    private ProductResponse.VariantResponse mapVariant(ProductVariant v) {
        ProductResponse.VariantResponse vr = new ProductResponse.VariantResponse();
        vr.setId(v.getId());
        vr.setSku(v.getSku());
        vr.setPrice(v.getPrice());
        vr.setCompareAtPrice(v.getCompareAtPrice());
        vr.setCostPrice(v.getCostPrice());
        vr.setStock(v.getStock());
        vr.setImageUrl(v.getImageUrl());
        vr.setDiscountPrice(v.getDiscountPrice()); // ← thêm
        vr.setEffectivePrice(v.getEffectivePrice()); // ← thêm
        vr.setDiscountPercent(v.getDiscountPercent()); // ← thêm
        vr.setStock(v.getStock());
        vr.setIsActive(v.getIsActive());

        if (v.getAttributeValues() != null) {
            vr.setAttributeValues(v.getAttributeValues().stream().map(av -> {
                ProductResponse.AttributeValueResponse avr = new ProductResponse.AttributeValueResponse();
                avr.setName(av.getAttribute().getName());
                avr.setValue(av.getValue());
                return avr;
            }).collect(Collectors.toList()));
        }

        return vr;
    }

    public ProductVariant setSalePrice(SaleRequest request) {
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy variant: " + request.getVariantId()));
        // Validate giá sale phải thấp hơn giá gốc
        if (request.getDiscountPrice() != null) {

            // 1. Kiểm tra phải nhỏ hơn giá bán
            if (request.getDiscountPrice().compareTo(variant.getPrice()) >= 0) {
                throw new RuntimeException(
                        "Giá sale phải nhỏ hơn giá bán (" + variant.getPrice() + ")");
            }

            // 2. Kiểm tra phải lớn hơn giá nhập
            if (request.getDiscountPrice().compareTo(variant.getCostPrice()) <= 0) {
                throw new RuntimeException(
                        "Giá sale phải lớn hơn giá nhập (" + variant.getCostPrice() + ")");
            }
        }
        variant.setDiscountPrice(request.getDiscountPrice());
        return variantRepository.save(variant);
    }

    // Admin bỏ sale
    public ProductVariant removeSale(Long variantId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy variant: " + variantId));
        variant.setDiscountPrice(null);
        return variantRepository.save(variant);
    }

    public Page<ProductResponse> getSaleProducts(int page, int size) {
        return productRepository.findSaleProducts(PageRequest.of(page, size))
                .map(product -> {
                    List<ProductVariant> variants = product.getVariants().stream()
                            .filter(ProductVariant::getIsActive)
                            .collect(Collectors.toList());
                    List<String> images = product.getImages().stream()
                            .map(ProductImage::getUrl)
                            .collect(Collectors.toList());
                    return mapToResponse(product, variants, images);
                });
    }

    public SaleResponse buildSaleResponse(ProductVariant variant) {
        SaleResponse res = new SaleResponse();
        res.setVariantId(variant.getId());
        res.setSku(variant.getSku());
        res.setImageUrl(variant.getImageUrl());
        res.setProductName(variant.getProduct().getName());
        res.setBrandName(variant.getProduct().getBrand() != null ? variant.getProduct().getBrand().getName() : null);
        res.setOriginalPrice(variant.getPrice());
        res.setDiscountPrice(variant.getDiscountPrice());
        res.setDiscountPercent(variant.getDiscountPercent());

        if (variant.getAttributeValues() != null) {
            res.setAttributeValues(variant.getAttributeValues().stream().map(av -> {
                ProductResponse.AttributeValueResponse avr = new ProductResponse.AttributeValueResponse();
                avr.setName(av.getAttribute().getName());
                avr.setValue(av.getValue());
                return avr;
            }).collect(Collectors.toList()));
        }

        if (variant.getCostPrice() != null) {
            res.setProfit(variant.getProfit());
            res.setProfitPercent(variant.getProfitPercent());

            if (variant.isLoss()) {
                res.setWarningLevel("DANGER");
                res.setWarningMessage(String.format(
                        "ĐANG LỖ! Bán %.0fđ nhưng nhập %.0fđ, lỗ %.0fđ/sp",
                        variant.getEffectivePrice().doubleValue(),
                        variant.getCostPrice().doubleValue(),
                        variant.getProfit().abs().doubleValue()));
            } else if (variant.getProfitPercent().compareTo(BigDecimal.valueOf(5)) < 0) {
                res.setWarningLevel("WARNING");
                res.setWarningMessage(String.format(
                        "Lợi nhuận rất thấp: %.2f%%", variant.getProfitPercent().doubleValue()));
            } else {
                res.setWarningLevel("OK");
                res.setWarningMessage(String.format(
                        "Lợi nhuận: %.2f%%", variant.getProfitPercent().doubleValue()));
            }
        }

        return res;
    }

    private void validatePrices(ProductRequest.VariantRequest vr) {
        if (vr.getCostPrice() == null) {
            throw new RuntimeException("Giá nhập không được để trống (SKU: " + vr.getSku() + ")");
        }

        // 1. Giá bán >= Giá nhập
        if (vr.getPrice() != null && vr.getPrice().compareTo(vr.getCostPrice()) < 0) {
            throw new RuntimeException(String.format(
                "LỖI (SKU: %s): Giá bán (%.0f) không được nhỏ hơn giá nhập (%.0f)",
                vr.getSku(), vr.getPrice().doubleValue(), vr.getCostPrice().doubleValue()));
        }

        // 2. Giá sale >= Giá nhập (nếu có sale)
        if (vr.getDiscountPrice() != null && vr.getDiscountPrice().compareTo(vr.getCostPrice()) < 0) {
            throw new RuntimeException(String.format(
                "LỖI (SKU: %s): Giá sale (%.0f) không được nhỏ hơn giá nhập (%.0f)",
                vr.getSku(), vr.getDiscountPrice().doubleValue(), vr.getCostPrice().doubleValue()));
        }

        // 3. Giá sale < Giá bán
        if (vr.getDiscountPrice() != null && vr.getDiscountPrice().compareTo(vr.getPrice()) >= 0) {
            throw new RuntimeException(String.format(
                "LỖI (SKU: %s): Giá sale (%.0f) phải nhỏ hơn giá bán hiện tại (%.0f)",
                vr.getSku(), vr.getDiscountPrice().doubleValue(), vr.getPrice().doubleValue()));
        }

        // 4. Giá gốc >= Giá bán
        BigDecimal comparePrice = vr.getCompareAtPrice() != null ? vr.getCompareAtPrice() : vr.getPrice();
        if (comparePrice != null && comparePrice.compareTo(vr.getPrice()) < 0) {
            throw new RuntimeException(String.format(
                "LỖI (SKU: %s): Giá gốc (%.0f) không được nhỏ hơn giá bán (%.0f)",
                vr.getSku(), comparePrice.doubleValue(), vr.getPrice().doubleValue()));
        }
    }
    private void checkTestCase(ProductRequest request) {

        if (request == null) {
            throw new RuntimeException("Request không được null");
        }

        // name
        if (request.getName() == null
                || request.getName().trim().isEmpty()) {

            throw new RuntimeException("Tên sản phẩm không được để trống");
        }

        // categoryId
        if (request.getCategoryId() == null
                || request.getCategoryId() <= 0) {

            throw new RuntimeException("Danh mục không hợp lệ");
        }

        // brandId
        if (request.getBrandId() == null
                || request.getBrandId() <= 0) {

            throw new RuntimeException("Thương hiệu không hợp lệ");
        }

        // variants
        if (request.getVariants() == null
                || request.getVariants().isEmpty()) {

            throw new RuntimeException("Sản phẩm phải có ít nhất 1 biến thể");
        }

        for (ProductRequest.VariantRequest v : request.getVariants()) {

            // sku
            if (v.getSku() == null || v.getSku().trim().isEmpty()) {
                throw new RuntimeException("SKU không được để trống");
            }

            // price
            if (v.getPrice() == null
                    || v.getPrice().compareTo(BigDecimal.ZERO) <= 0) {

                throw new RuntimeException("Giá bán phải lớn hơn 0");
            }

            // discountPrice
            if (v.getDiscountPrice() != null
                    && v.getDiscountPrice().compareTo(v.getPrice()) > 0) {

                throw new RuntimeException("Giá khuyến mãi không được lớn hơn giá bán");
            }

            // stock
            if (v.getStock() == null || v.getStock() < 0) {
                throw new RuntimeException("Tồn kho không hợp lệ");
            }

            // attributeValueIds
            if (v.getAttributeValueIds() == null
                    || v.getAttributeValueIds().isEmpty()) {

                throw new RuntimeException("Biến thể phải có thuộc tính");
            }
        }
    }

}
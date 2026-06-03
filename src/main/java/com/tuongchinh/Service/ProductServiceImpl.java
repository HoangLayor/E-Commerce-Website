//package com.tuongchinh.Service;
//
//import com.tuongchinh.DTO.BestSellingProductDTO;
//import com.tuongchinh.DTO.ProductRequest;
//import com.tuongchinh.DTO.ProductResponse;
//import com.tuongchinh.Entity.*;
//import com.tuongchinh.Repository.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.domain.*;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.math.BigDecimal;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class ProductServiceImpl implements ProductService {
//
//    private final ProductRepository productRepository;
//    private final CategoryRepository categoryRepository;
//    private final BrandRepository brandRepository;
//    private final ProductVariantRepository variantRepository;
//    private final ProductImageRepository productImageRepository;
//    private final OrderItemRepository orderItemRepository;
//    private final CloudinaryService cloudinaryService;
//
//    // =====================
//    // TÌM KIẾM & LỌC
//    // =====================
//    @Override
//    public Product getById(Long id) {
//        return productRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm: " + id));
//    }
//
//    @Override
//    public Page<Product> searchProducts(
//            String keyword,
//            Double minPrice,
//            Double maxPrice,
//            Long categoryId,
//            Long brandId,
//            Boolean inStock,
//            int page, int size,
//            String sortBy, String sortDir) {
//
//        Sort sort = sortDir.equalsIgnoreCase("desc")
//                ? Sort.by(sortBy).descending()
//                : Sort.by(sortBy).ascending();
//
//        Pageable pageable = PageRequest.of(page, size, sort);
//
//        return productRepository.findAll(
//                ProductSpecification.filter(keyword, minPrice, maxPrice, categoryId, brandId, inStock),
//                pageable
//        );
//    }
//
//    // =====================
//    // CHI TIẾT SẢN PHẨM
//    // =====================
//    @Override
//    public ProductResponse getProductDetail(Long id) {
//        Product product = productRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm: " + id));
//
//        List<ProductVariant> variants = variantRepository
//                .findByProductIdAndIsActiveTrue(id);
//
//        List<String> images = productImageRepository
//                .findUrlsByProductId(id);
//
//        return mapToDetailResponse(product, variants, images);
//    }
//
//    // =====================
//    // THÊM SẢN PHẨM (Admin)
//    // =====================
//    @Override
//    public ProductResponse create(ProductRequest request, List<MultipartFile> images) {
//
//        Category category = categoryRepository.findById(request.getCategoryId())
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + request.getCategoryId()));
//
//        Brand brand = brandRepository.findById(request.getBrandId())
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu: " + request.getBrandId()));
//
//        // Tạo product
//        Product product = new Product();
//        product.setName(request.getName());
//        product.setDescription(request.getDescription());
//        product.setCategory(category);
//        product.setBrand(brand);
//        productRepository.save(product);
//
//        // Upload ảnh → product_image
//        if (images != null && !images.isEmpty()) {
//            for (MultipartFile file : images) {
//                if (!file.isEmpty()) {
//                    String url = cloudinaryService.uploadImage(file);
//                    ProductImage img = new ProductImage();
//                    img.setProduct(product);
//                    img.setUrl(url);
//                    productImageRepository.save(img);
//                }
//            }
//        }
//
//        // Tạo variants
//        if (request.getVariants() != null) {
//            for (ProductRequest.VariantRequest vr : request.getVariants()) {
//                ProductVariant variant = new ProductVariant();
//                variant.setProduct(product);
//                variant.setSku(vr.getSku());
//                variant.setPrice(vr.getPrice());
//                variant.setStock(vr.getStock());
//                variant.setIsActive(true);
//                variantRepository.save(variant);
//            }
//        }
//
//        return mapToDetailResponse(product,
//                variantRepository.findByProductIdAndIsActiveTrue(product.getId()),
//                productImageRepository.findUrlsByProductId(product.getId()));
//    }
//
//    // =====================
//    // SỬA SẢN PHẨM (Admin)
//    // =====================
//    @Override
//    public ProductResponse update(ProductRequest request, List<MultipartFile> images, Long id) {
//
//        Product product = productRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm: " + id));
//
//        Category category = categoryRepository.findById(request.getCategoryId())
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + request.getCategoryId()));
//
//        Brand brand = brandRepository.findById(request.getBrandId())
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu: " + request.getBrandId()));
//
//        product.setName(request.getName());
//        product.setDescription(request.getDescription());
//        product.setCategory(category);
//        product.setBrand(brand);
//        productRepository.save(product);
//
//        // Upload ảnh mới nếu có
//        if (images != null && !images.isEmpty()) {
//            for (MultipartFile file : images) {
//                if (!file.isEmpty()) {
//                    String url = cloudinaryService.uploadImage(file);
//                    ProductImage img = new ProductImage();
//                    img.setProduct(product);
//                    img.setUrl(url);
//                    productImageRepository.save(img);
//                }
//            }
//        }
//
//        return mapToDetailResponse(product,
//                variantRepository.findByProductIdAndIsActiveTrue(id),
//                productImageRepository.findUrlsByProductId(id));
//    }
//
//    // =====================
//    // XÓA
//    // =====================
//    @Override
//    public void delete(Long id) {
//        // Soft delete: tắt hết variant thay vì xóa
//        List<ProductVariant> variants = variantRepository.findByProductId(id);
//        variants.forEach(v -> v.setIsActive(false));
//        variantRepository.saveAll(variants);
//    }
//
//    // =====================
//    // CÁC API PHỤ
//    // =====================
//    @Override
//    public List<Product> getProductsByCategoryId(Long categoryId) {
//        return productRepository.findByCategoryId(categoryId);
//    }
//
//    @Override
//    public List<BestSellingProductDTO> getBestSellingProducts(int limit) {
//        return orderItemRepository.findBestSellingProducts(PageRequest.of(0, limit));
//    }
//
//    @Override
//    public List<Product> getNewProducts(int limit) {
//        return productRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
//    }
//
//    // =====================
//    // MAPPER
//    // =====================
//    private ProductResponse mapToDetailResponse(
//            Product product,
//            List<ProductVariant> variants,
//            List<String> images) {
//
//        BigDecimal priceMin = variants.stream()
//                .map(ProductVariant::getPrice)
//                .min(BigDecimal::compareTo)
//                .orElse(BigDecimal.ZERO);
//
//        ProductResponse res = new ProductResponse();
//        res.setId(product.getId());
//        res.setName(product.getName());
//        res.setDescription(product.getDescription());
//        res.setCategoryId(product.getCategory().getId());
//        res.setCategoryName(product.getCategory().getName());
//        res.setBrandId(product.getBrand() != null ? product.getBrand().getId() : null);
//        res.setBrandName(product.getBrand() != null ? product.getBrand().getName() : null);
//        res.setThumbnail(images.isEmpty() ? null : images.get(0));
//        res.setImages(images);
//        res.setPriceMin(priceMin);
//        res.setVariants(variants.stream().map(this::mapVariant).toList());
//        return res;
//    }
//
//    private ProductResponse.VariantResponse mapVariant(ProductVariant v) {
//        ProductResponse.VariantResponse vr = new ProductResponse.VariantResponse();
//        vr.setId(v.getId());
//        vr.setSku(v.getSku());
//        vr.setPrice(v.getPrice());
//        vr.setStock(v.getStock());
//        vr.setImageUrl(v.getImageUrl());
//        vr.setIsActive(v.getIsActive());
//        return vr;
//    }
//}
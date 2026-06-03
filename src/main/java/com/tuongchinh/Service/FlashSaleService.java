package com.tuongchinh.Service;

import com.tuongchinh.DTO.CreateFlashSaleRequest;
import com.tuongchinh.DTO.AddFlashSaleVariantRequest;
import com.tuongchinh.DTO.FlashSaleProductResponse;
import com.tuongchinh.DTO.FlashSaleResponse;
import com.tuongchinh.Entity.FlashSale;
import com.tuongchinh.Entity.FlashSaleProduct;
import com.tuongchinh.Entity.ProductVariant;
import com.tuongchinh.Repository.FlashSaleProductRepository;
import com.tuongchinh.Repository.FlashSaleRepository;
import com.tuongchinh.Repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FlashSaleService {

    private final FlashSaleRepository flashSaleRepository;

    private final FlashSaleProductRepository flashSaleProductRepository;

    private final ProductVariantRepository productVariantRepository;

    // =========================
    // create flash sale
    // =========================
    @Transactional
    public FlashSale createFlashSale(
            CreateFlashSaleRequest request
    ) {

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new RuntimeException("Thời gian bắt đầu phải trước thời gian kết thúc");
        }

        FlashSale flashSale = new FlashSale();

        flashSale.setName(
                request.getName()
        );

        flashSale.setStartTime(
                request.getStartTime()
        );

        flashSale.setEndTime(
                request.getEndTime()
        );

        flashSale.setIsActive(Boolean.TRUE
        );

        return flashSaleRepository.save(
                flashSale
        );
    }

    // =========================
    // add variant vào flash sale
    // =========================
    @Transactional
    public FlashSaleProduct addFlashSaleVariant(
            Long flashSaleId,
            AddFlashSaleVariantRequest request
    ) {

        FlashSale flashSale =
                flashSaleRepository.findById(
                        flashSaleId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Flash sale not found"
                        ));

        ProductVariant variant =
                productVariantRepository.findById(
                        request.getVariantId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Variant not found"
                        ));

        // validate
        if (request.getQuantity() > variant.getStock()) {
            throw new RuntimeException(
                    "Số lượng Flash Sale không được vượt quá tồn kho thực tế (" + variant.getStock() + ")"
            );
        }

        if (
                request.getSalePrice()
                        .compareTo(
                                variant.getPrice()
                        ) >= 0
        ) {

            throw new RuntimeException(
                    "Giá Sale phải thấp hơn giá gốc của sản phẩm"
            );
        }

        boolean exists =
                flashSaleProductRepository
                        .existsByFlashSaleIdAndVariantId(
                                flashSaleId,
                                variant.getId()
                        );

        if (exists) {
            throw new RuntimeException(
                    "Variant already exists in flash sale"
            );
        }

        // create flash sale product
        FlashSaleProduct flashSaleProduct =
                new FlashSaleProduct();

        flashSaleProduct.setFlashSale(
                flashSale
        );
        variant.setDiscountPrice(request.getSalePrice());
        flashSaleProduct.setVariant(
                variant
        );

        flashSaleProduct.setSalePrice(
                request.getSalePrice()
        );

        flashSaleProduct.setQuantity(
                request.getQuantity()
        );

        flashSaleProduct.setSoldQuantity(0);

        flashSaleProduct.setMaxUser(
                request.getMaxPerUser()
        );

        // update variant
        variant.setDiscountPrice(
                request.getSalePrice()
        );

        variant.setIsFlashSale(true);

        productVariantRepository.save(
                variant
        );
        return flashSaleProductRepository.save(
                flashSaleProduct
        );
    }
    public List<FlashSaleResponse> getActiveFlashSales() {

        List<FlashSale> flashSales =
                flashSaleRepository.findByIsActiveTrue();

        return flashSales.stream().map(flashSale -> {

            FlashSaleResponse response =
                    new FlashSaleResponse();

            response.setId(flashSale.getId());

            response.setName(flashSale.getName());

            response.setStartTime(
                    flashSale.getStartTime()
            );

            response.setEndTime(
                    flashSale.getEndTime()
            );

            response.setIsActive(
                    flashSale.getIsActive()
            );

            List<FlashSaleProductResponse> productResponses =
                    flashSaleProductRepository
                            .findByFlashSaleId(
                                    flashSale.getId()
                            )
                            .stream()
                            .map(item -> {

                                FlashSaleProductResponse p =
                                        new FlashSaleProductResponse();

                                p.setId(item.getId());

                                p.setVariantId(
                                        item.getVariant().getId()
                                );

                                p.setProductId(
                                        item.getVariant()
                                                .getProduct()
                                                .getId()
                                );

                                p.setProductName(
                                        item.getVariant()
                                                .getProduct()
                                                .getName()
                                );

                                p.setOriginalPrice(
                                        item.getVariant().getPrice()
                                );

                                p.setSalePrice(
                                        item.getSalePrice()
                                );

                                p.setQuantity(
                                        item.getQuantity()
                                );

                                p.setSoldQuantity(
                                        item.getSoldQuantity()
                                );

                                p.setMaxPerUser(
                                        item.getMaxUser()
                                );

                                p.setImage(
                                        item.getVariant().getImageUrl()
                                );

                                return p;

                            }).toList();

            response.setProducts(productResponses);

            return response;

        }).toList();
    }

    public List<FlashSaleResponse> getAllFlashSales() {

        List<FlashSale> flashSales =
                flashSaleRepository.findAll();

        return flashSales.stream().map(this::mapToResponse).toList();
    }
    @Transactional
    public FlashSaleResponse toggleFlashSaleStatus(
            Long flashSaleId
    ) {

        FlashSale flashSale =
                flashSaleRepository.findById(
                        flashSaleId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Flash sale not found"
                        ));

        boolean newStatus = !flashSale.getIsActive();
        flashSale.setIsActive(newStatus);

        // cập nhật flash sale của variant
        List<FlashSaleProduct> products =
                flashSaleProductRepository
                        .findByFlashSaleId(
                                flashSaleId
                        );

        for (FlashSaleProduct item : products) {

            ProductVariant variant =
                    item.getVariant();

            variant.setIsFlashSale(newStatus);

            variant.setDiscountPrice(newStatus ? item.getSalePrice() : null);

            productVariantRepository.save(
                    variant
            );
        }

        flashSaleRepository.save(
                flashSale
        );
        
        return mapToResponse(flashSale);
    }
    public FlashSaleResponse updateFlashSale(Long id, CreateFlashSaleRequest req) {

        FlashSale flashSale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flash sale không tồn tại"));

        if (req.getStartTime().isAfter(req.getEndTime()) || req.getStartTime().isEqual(req.getEndTime())) {
            throw new RuntimeException("Thời gian bắt đầu phải trước thời gian kết thúc");
        }

        flashSale.setName(req.getName());
        flashSale.setStartTime(req.getStartTime());
        flashSale.setEndTime(req.getEndTime());
        flashSaleRepository.save(flashSale);
        return mapToResponse(flashSale);
    }
    private FlashSaleResponse mapToResponse(
            FlashSale flashSale
    ) {

        FlashSaleResponse response =
                new FlashSaleResponse();

        response.setId(
                flashSale.getId()
        );

        response.setName(
                flashSale.getName()
        );

        response.setStartTime(
                flashSale.getStartTime()
        );

        response.setEndTime(
                flashSale.getEndTime()
        );

        response.setIsActive(
                flashSale.getIsActive()
        );

        List<FlashSaleProductResponse> productResponses =
                flashSaleProductRepository
                        .findByFlashSaleId(
                                flashSale.getId()
                        )
                        .stream()
                        .map(item -> {

                            FlashSaleProductResponse p =
                                    new FlashSaleProductResponse();

                            p.setId(item.getId());

                            p.setVariantId(
                                    item.getVariant().getId()
                            );

                            p.setProductId(
                                    item.getVariant()
                                            .getProduct()
                                            .getId()
                            );

                            p.setProductName(
                                    item.getVariant()
                                            .getProduct()
                                            .getName()
                            );

                            p.setOriginalPrice(
                                    item.getVariant().getPrice()
                            );

                            p.setSalePrice(
                                    item.getSalePrice()
                            );

                            p.setQuantity(
                                    item.getQuantity()
                            );

                            p.setSoldQuantity(
                                    item.getSoldQuantity()
                            );

                            p.setMaxPerUser(
                                    item.getMaxUser()
                            );

                            p.setImage(
                                    item.getVariant().getImageUrl()
                            );

                            return p;

                        }).toList();

        response.setProducts(productResponses);

        return response;
    }
}
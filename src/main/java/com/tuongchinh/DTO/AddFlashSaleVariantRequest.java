package com.tuongchinh.DTO;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Data
public class AddFlashSaleVariantRequest {

    private Long variantId;
    private BigDecimal salePrice;
    private Integer quantity;
    private Integer maxPerUser;

    @Getter
    @Setter
    public static class PageResponse {

        private Long id;

        private String name;

        private String slug;

        private List<SectionResponse> sections;
    }
}
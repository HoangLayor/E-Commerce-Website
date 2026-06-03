package com.tuongchinh.DTO;

public class BestSellingProductDTO {
    private Long productId;
    private String productName;
    private Long totalSold;

    public BestSellingProductDTO(Long productId, String productName, Long totalSold) {
        this.productId = productId;
        this.productName = productName;
        this.totalSold = totalSold;
    }

    // getter
}

package com.tuongchinh.DTO;

import lombok.Data;
import java.util.List;

@Data
public class ReviewListResponse {
    private Integer totalReviews;
    private Integer currentPage;
    private Integer totalPages;
    private Integer pageSize;

    private List<ReviewResponse> reviews;
}
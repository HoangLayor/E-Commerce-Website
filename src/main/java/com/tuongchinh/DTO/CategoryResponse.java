package com.tuongchinh.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private Long parentId;
    private Long productCount;
    private List<CategoryResponse> children;
}
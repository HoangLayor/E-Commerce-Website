package com.tuongchinh.Service;

import com.tuongchinh.DTO.CategoryRequest;
import com.tuongchinh.DTO.CategoryResponse;
import com.tuongchinh.Entity.Category;

import java.util.List;
import java.util.Map;

public interface CategoryService {
    List<CategoryResponse> getAll();
//    CategoryResponse getById(Long id);

      void delete(Long id);
      String create(CategoryRequest request);
      CategoryResponse update(Long id, CategoryRequest request);
      List<Long> getCategoryIdsWithChildren(List<Long> categoryIds);
      CategoryResponse mapToResponse(Category category, Map<Long, List<Category>> groupByParent);
      void checkTestCase(CategoryRequest request);
}
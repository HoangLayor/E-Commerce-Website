package com.tuongchinh.Service;

import com.tuongchinh.DTO.CategoryRequest;
import com.tuongchinh.DTO.CategoryResponse;
import com.tuongchinh.Entity.Category;
import com.tuongchinh.Repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final com.tuongchinh.Repository.ProductRepository productRepository;

    @Override
    public List<CategoryResponse> getAll() {
        List<Category> all = categoryRepository.findAll();
        Map<Long, List<Category>> groupByParent = all.stream()
                .filter(c -> c.getParent() != null)
                .collect(Collectors.groupingBy(c -> c.getParent().getId()));
        return all.stream()
                .filter(c -> c.getParent() == null)
                .map(c -> mapToResponse(c, groupByParent))
                .collect(Collectors.toList());
    }

    @Override
    public String create(CategoryRequest request) {
        checkTestCase(request);
        try {
            Category category = new Category();
            category.setName(request.getName());
            category.setDescription(request.getDescription());
            if (request.getParentId() != null) {
                Category parent = categoryRepository.findById(request.getParentId())
                        .orElseThrow(
                                () -> new RuntimeException("Không tìm thấy danh mục cha: " + request.getParentId()));
                category.setParent(parent);
            }
            categoryRepository.save(category);
            return "Tạo danh mục thành công";
        } catch (Exception e) {
            return "Lỗi: " + e.getMessage();
        }
    }

    @Override
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + id));
        categoryRepository.delete(category);
    }

    // Map entity sang response
    public CategoryResponse mapToResponse(Category category, Map<Long, List<Category>> groupByParent) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setParentId(category.getParent() != null ? category.getParent().getId() : null);

        // Dùng groupByParent đã build sẵn thay vì gọi getChildren() (tránh N+1 lazy load)
        List<Category> children = groupByParent.getOrDefault(category.getId(), Collections.emptyList());

        // Map con trước để tính productCount của con
        List<CategoryResponse> mappedChildren = children.stream()
                .map(c -> mapToResponse(c, groupByParent))
                .collect(Collectors.toList());
        response.setChildren(mappedChildren);

        // Tính productCount = của bản thân + tổng của con
        long count = productRepository.countByCategoryId(category.getId());
        for (CategoryResponse child : mappedChildren) {
            count += (child.getProductCount() != null ? child.getProductCount() : 0);
        }
        response.setProductCount(count);

        return response;
    }

    @Override
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + id));

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cha: " + request.getParentId()));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        return mapToResponse(categoryRepository.save(category), new HashMap<>());
    }

    @Override
    public List<Long> getCategoryIdsWithChildren(List<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Category> allCategories = categoryRepository.findAll();
        Map<Long, List<Long>> parentToChildrenIds = allCategories.stream()
                .filter(c -> c.getParent() != null)
                .collect(Collectors.groupingBy(
                        c -> c.getParent().getId(),
                        Collectors.mapping(Category::getId, Collectors.toList())
                ));

        java.util.Set<Long> resultIds = new java.util.HashSet<>();
        for (Long id : categoryIds) {
            addChildrenRecursive(id, parentToChildrenIds, resultIds);
        }
        return new ArrayList<>(resultIds);
    }

    private void addChildrenRecursive(Long parentId, Map<Long, List<Long>> parentToChildrenIds, java.util.Set<Long> resultIds) {
        resultIds.add(parentId);
        List<Long> children = parentToChildrenIds.get(parentId);
        if (children != null) {
            for (Long childId : children) {
                addChildrenRecursive(childId, parentToChildrenIds, resultIds);
            }
        }
    }
    public void checkTestCase(CategoryRequest request) {

        if (request == null) {
            throw new RuntimeException("Request không được null");
        }

        // name
        if (request.getName() == null
                || request.getName().trim().isEmpty()) {

            throw new RuntimeException("Tên danh mục không được để trống");
        }

        // độ dài
        if (request.getName().length() > 100) {
            throw new RuntimeException("Tên danh mục quá dài");
        }

        // regex
        if (!request.getName()
                .matches("^[a-zA-ZÀ-ỹ0-9\\s]+$")) {

            throw new RuntimeException("Tên danh mục không hợp lệ");
        }

        // chống script
        String nameLower = request.getName().toLowerCase();

        if (nameLower.contains("<script>")) {
            throw new RuntimeException("Tên danh mục chứa nội dung nguy hiểm");
        }

        // description
        if (request.getDescription() != null
                && request.getDescription().length() > 500) {

            throw new RuntimeException("Mô tả quá dài");
        }

        // parentId
        if (request.getParentId() != null
                && request.getParentId() <= 0) {

            throw new RuntimeException("parentId không hợp lệ");
        }
    }
}
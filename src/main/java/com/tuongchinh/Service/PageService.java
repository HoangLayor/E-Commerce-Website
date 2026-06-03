package com.tuongchinh.Service;

import com.tuongchinh.DTO.PageResponseDTO;
import com.tuongchinh.DTO.PageSummaryDTO;
import com.tuongchinh.DTO.SectionResponseDTO;
import com.tuongchinh.Entity.Page;
import com.tuongchinh.Entity.PageSection;
import com.tuongchinh.Repository.PageRepository;
import com.tuongchinh.Repository.PageSectionRepository;
import com.tuongchinh.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import com.tuongchinh.DTO.CreatePageRequest;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PageService {

    private final PageRepository pageRepository;
    private final PageSectionRepository pageSectionRepository;
    private final CacheManager cacheManager;

    private void evictPageCache(String slug) {
        if (cacheManager.getCache("page_layouts") != null) {
            cacheManager.getCache("page_layouts").evict(slug);
        }
    }

    @Cacheable(value = "page_layouts", key = "#slug")
    public PageResponseDTO getPageLayoutBySlug(String slug) {
        Page page = pageRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found with slug: " + slug));

        List<PageSection> sections = pageSectionRepository.findByPageIdAndActiveTrueOrderByPositionAsc(page.getId());

        List<SectionResponseDTO> sectionDTOs = sections.stream()
                .map(section -> SectionResponseDTO.builder()
                        .id(section.getId())
                        .type(section.getType())
                        .title(section.getTitle())
                        .position(section.getPosition())
                        .configJson(section.getConfigJson())
                        .active(section.getActive())
                        .build())
                .collect(Collectors.toList());

        return PageResponseDTO.builder()
                .name(page.getName())
                .slug(page.getSlug())
                .sections(sectionDTOs)
                .build();
    }



    public List<PageSummaryDTO> getAllPages() {
        return pageRepository.findAll().stream()
                .map(page -> PageSummaryDTO.builder()
                        .id(page.getId())
                        .name(page.getName())
                        .slug(page.getSlug())
                        .active(page.getActive())
                        .createdAt(page.getCreatedAt())
                        .updatedAt(page.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public PageSummaryDTO createPage(CreatePageRequest request) {
        Page page = Page.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();
        page = pageRepository.save(page);
        return mapToSummary(page);
    }

    public PageSummaryDTO updatePage(Long id, CreatePageRequest request) {
        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found"));
        
        String oldSlug = page.getSlug();
        page.setName(request.getName());
        page.setSlug(request.getSlug());
        if (request.getActive() != null) {
            page.setActive(request.getActive());
        }
        
        page = pageRepository.save(page);
        
        if (!oldSlug.equals(page.getSlug())) {
            evictPageCache(oldSlug);
        }
        evictPageCache(page.getSlug());
        
        return mapToSummary(page);
    }

    public void deletePage(Long id) {
        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found"));
        pageRepository.delete(page);
        evictPageCache(page.getSlug());
    }

    private PageSummaryDTO mapToSummary(Page page) {
        return PageSummaryDTO.builder()
                .id(page.getId())
                .name(page.getName())
                .slug(page.getSlug())
                .active(page.getActive())
                .createdAt(page.getCreatedAt())
                .updatedAt(page.getUpdatedAt())
                .build();
    }
}
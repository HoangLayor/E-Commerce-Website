package com.tuongchinh.Service;

import com.tuongchinh.DTO.CreatePageSectionRequest;
import com.tuongchinh.DTO.PageSectionResponse;
import com.tuongchinh.DTO.ReorderSectionRequest;
import com.tuongchinh.Entity.Page;
import com.tuongchinh.Entity.PageSection;
import com.tuongchinh.Repository.PageRepository;
import com.tuongchinh.Repository.PageSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.CacheManager;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PageSectionService {

    private final PageRepository pageRepository;

    private final PageSectionRepository pageSectionRepository;

    private final CacheManager cacheManager;

    private void evictPageCache(String slug) {
        if (cacheManager.getCache("page_layouts") != null) {
            cacheManager.getCache("page_layouts").evict(slug);
        }
    }

    // =========================================
    // CREATE
    // =========================================

    public PageSectionResponse create(
            CreatePageSectionRequest req
    ) {

        Page page = pageRepository.findById(
                        req.getPageId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Page not found"
                        ));

        PageSection section = new PageSection();

        section.setPage(page);

        section.setType(req.getType());

        section.setTitle(req.getTitle());

        section.setPosition(req.getPosition());

        section.setConfigJson(req.getConfigJson());

        section.setActive(req.getActive() != null ? req.getActive() : true);

        section = pageSectionRepository.save(section);

        evictPageCache(page.getSlug());

        return mapToResponse(section);
    }

    // =========================================
    // GET BY PAGE
    // =========================================

    public List<PageSectionResponse> getByPage(
            Long pageId
    ) {

        Page page = pageRepository.findById(
                        pageId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Page not found"
                        ));

        return pageSectionRepository
                .findByPageIdOrderByPositionAsc(
                        pageId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================
    // DETAIL
    // =========================================

    public PageSectionResponse getDetail(
            Long id
    ) {

        PageSection section =
                pageSectionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Section not found"
                                ));

        return mapToResponse(section);
    }

    // =========================================
    // UPDATE
    // =========================================

    public PageSectionResponse update(
            Long id,
            CreatePageSectionRequest req
    ) {

        PageSection section =
                pageSectionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Section not found"
                                ));

        Page page = pageRepository.findById(
                        req.getPageId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Page not found"
                        ));

        section.setPage(page);

        section.setType(req.getType());

        section.setTitle(req.getTitle());

        section.setPosition(req.getPosition());

        section.setConfigJson(req.getConfigJson());
        
        if (req.getActive() != null) {
            section.setActive(req.getActive());
        }

        section = pageSectionRepository.save(section);

        evictPageCache(page.getSlug());

        return mapToResponse(section);
    }

    // =========================================
    // DELETE
    // =========================================

    public void delete(Long id) {

        PageSection section =
                pageSectionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Section not found"
                                ));

        pageSectionRepository.delete(section);

        evictPageCache(section.getPage().getSlug());
    }

    // =========================================
    // REORDER
    // =========================================

    public void reorderSections(Long pageId, List<ReorderSectionRequest> requests) {
        Page page = pageRepository.findById(pageId)
                .orElseThrow(() -> new RuntimeException("Page not found"));

        for (ReorderSectionRequest req : requests) {
            PageSection section = pageSectionRepository.findById(req.getId())
                    .orElse(null);
            if (section != null && section.getPage().getId().equals(pageId)) {
                section.setPosition(req.getPosition());
                pageSectionRepository.save(section);
            }
        }
        
        evictPageCache(page.getSlug());
    }

    // =========================================
    // MAP RESPONSE
    // =========================================

    private PageSectionResponse mapToResponse(
            PageSection section
    ) {

        PageSectionResponse response =
                new PageSectionResponse();

        response.setId(section.getId());

        response.setPageId(
                section.getPage().getId()
        );

        response.setType(
                section.getType()
        );

        response.setTitle(
                section.getTitle()
        );

        response.setPosition(
                section.getPosition()
        );

        response.setConfigJson(
                section.getConfigJson()
        );

        response.setActive(
                section.getActive()
        );

        return response;
    }
}
package com.tuongchinh.Service;

import com.tuongchinh.DTO.BannerItemResponse;
import com.tuongchinh.DTO.CreateBannerItemRequest;
import com.tuongchinh.Entity.Banner;
import com.tuongchinh.Entity.BannerItem;
import com.tuongchinh.Repository.BannerItemRepository;
import com.tuongchinh.Repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BannerItemService {

    private final BannerRepository bannerRepository;

    private final BannerItemRepository bannerItemRepository;

    private final CloudinaryService cloudinaryService;

    // =========================================
    // CREATE
    // =========================================

    public BannerItemResponse create(
            CreateBannerItemRequest req
    ) {

        Banner banner = bannerRepository.findById(
                        req.getBannerId()
                )
                .orElseThrow(() ->
                        new RuntimeException("Banner not found"));

        String imageUrl =
                cloudinaryService.uploadImage(
                        req.getImage()
                );

        String mobileImageUrl = null;

        BannerItem item = new BannerItem();

        item.setBanner(banner);

        item.setImageUrl(imageUrl);
        item.setPosition(req.getPosition());

        item.setActive(true);

        item = bannerItemRepository.save(item);

        return mapToResponse(item);
    }

    // =========================================
    // UPDATE
    // =========================================

    public BannerItemResponse update(
            Long id,
            CreateBannerItemRequest req
    ) {

        BannerItem item =
                bannerItemRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Banner item not found"
                                ));

        Banner banner = bannerRepository.findById(
                        req.getBannerId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Banner not found"
                        ));

        item.setBanner(banner);

        // upload image mới nếu có
        if (req.getImage() != null
                && !req.getImage().isEmpty()) {

            String imageUrl =
                    cloudinaryService.uploadImage(
                            req.getImage()
                    );

            item.setImageUrl(imageUrl);
        }

        // upload mobile image mới nếu có

        item.setPosition(
                req.getPosition()
        );

        item = bannerItemRepository.save(item);

        return mapToResponse(item);
    }

    // =========================================
    // DELETE
    // =========================================

    public void delete(Long id) {

        BannerItem item =
                bannerItemRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Banner item not found"
                                ));

        bannerItemRepository.delete(item);
    }

    // =========================================
    // DETAIL
    // =========================================

    public BannerItemResponse getDetail(
            Long id
    ) {

        BannerItem item =
                bannerItemRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Banner item not found"
                                ));

        return mapToResponse(item);
    }

    // =========================================
    // LIST BY BANNER
    // =========================================

    public java.util.List<BannerItemResponse> getByBanner(Long bannerId) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new RuntimeException("Banner not found"));

        return bannerItemRepository
                .findByBannerAndActiveTrueOrderByPositionAsc(banner)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================
    // MAP RESPONSE
    // =========================================

    private BannerItemResponse mapToResponse(
            BannerItem bannerItem
    ) {

        BannerItemResponse response =
                new BannerItemResponse();

        response.setId(
                bannerItem.getId()
        );

        response.setImageUrl(
                bannerItem.getImageUrl()
        );


        response.setPosition(
                bannerItem.getPosition()
        );

        response.setActive(
                bannerItem.getActive()
        );

        return response;
    }
}
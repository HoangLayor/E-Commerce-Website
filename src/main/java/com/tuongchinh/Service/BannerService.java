package com.tuongchinh.Service;

import com.tuongchinh.DTO.BannerResponse;
import com.tuongchinh.DTO.CreateBannerRequest;
import com.tuongchinh.Entity.Banner;
import com.tuongchinh.Repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    public BannerResponse create(CreateBannerRequest req) {

        Banner banner = new Banner();

        banner.setName(req.getName());

        banner.setActive(true);

        bannerRepository.save(banner);
        return MaptoReponse(banner);
    }

    // =========================================
    // GET ALL
    // =========================================

    public List<BannerResponse> getAll() {
        List<BannerResponse> responses=new ArrayList<>();
        List<Banner> banners = bannerRepository.findAll();
        for (Banner x: banners){
            responses.add(MaptoReponse(x));
        }
        return responses;
    }

    // =========================================
    // GET DETAIL
    // =========================================

    public Banner getDetail(Long id) {

        return bannerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Banner not found"));
    }

    // =========================================
    // UPDATE
    // =========================================

    public BannerResponse update(Long id,
                         CreateBannerRequest req) {

        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Banner not found"));

        banner.setName(req.getName());
        bannerRepository.save(banner);
        return MaptoReponse(banner);
    }

    // =========================================
    // DELETE
    // =========================================

    public void delete(Long id) {

        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Banner not found"));

        bannerRepository.delete(banner);
    }
    public BannerResponse setActive(Long id){
        Banner banner = bannerRepository.findById(id).orElseThrow(()->new RuntimeException("Banner not found"));
        if(banner.getActive()==true) banner.setActive(false);
        else banner.setActive(true);
        bannerRepository.save(banner);
        return MaptoReponse(banner);
    }
    private BannerResponse MaptoReponse(Banner banner){
        BannerResponse bannerResponse= new BannerResponse();
        bannerResponse.setId(banner.getId());
        bannerResponse.setActive(banner.getActive());
        bannerResponse.setName(banner.getName());
        return bannerResponse;
    }
}

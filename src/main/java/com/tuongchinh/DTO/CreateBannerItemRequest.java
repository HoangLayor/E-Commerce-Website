package com.tuongchinh.DTO;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class CreateBannerItemRequest {
    private Long bannerId;
    private MultipartFile image;
    private Integer position;
}
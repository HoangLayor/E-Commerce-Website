package com.tuongchinh.Service;

import com.tuongchinh.DTO.AttributeResponse;
import com.tuongchinh.Entity.Attribute;
import com.tuongchinh.Repository.AttributeRepository;
import com.tuongchinh.Repository.AttributeValueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttributeService {
    private final AttributeRepository attributeRepository;
    private final AttributeValueRepository attributeValueRepository;

    public List<AttributeResponse> getAllAttributes() {
        return attributeRepository.findAll().stream().map(attr -> {
            AttributeResponse res = new AttributeResponse();
            res.setId(attr.getId());
            res.setName(attr.getName());
            res.setValues(attributeValueRepository.findByAttributeId(attr.getId()).stream().map(val -> {
                AttributeResponse.AttributeValueResponse vres = new AttributeResponse.AttributeValueResponse();
                vres.setId(val.getId());
                vres.setValue(val.getValue());
                return vres;
            }).collect(Collectors.toList()));
            return res;
        }).collect(Collectors.toList());
    }
}

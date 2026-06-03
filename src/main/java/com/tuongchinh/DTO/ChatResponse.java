package com.tuongchinh.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String response;
    
    @JsonProperty("product_ids")
    private List<Long> productIds;

    public ChatResponse(String response) {
        this.response = response;
    }
}

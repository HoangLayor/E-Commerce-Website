package com.tuongchinh.DTO;

import com.tuongchinh.DTO.UserRequest;

import lombok.Data;

@Data
public class UserRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String imageUrl;
    private String gender;
    private String role;
}

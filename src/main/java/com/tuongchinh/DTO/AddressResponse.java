// AddressResponse.java
package com.tuongchinh.DTO;

import lombok.Data;

@Data
public class AddressResponse {
    private Long id;
    private String receiverName;
    private String phone;
    private String address;
    private Boolean isDefault;
}
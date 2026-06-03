// AddressRequest.java
package com.tuongchinh.DTO;

import lombok.Data;

@Data
public class AddressRequest {
    private String receiverName;
    private String phone;
    private String address;
    private Boolean isDefault = false;
}
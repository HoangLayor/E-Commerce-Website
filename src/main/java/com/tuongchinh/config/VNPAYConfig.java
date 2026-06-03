package com.tuongchinh.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import jakarta.servlet.http.HttpServletRequest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Configuration
@ConfigurationProperties(prefix = "vnpay")
@Getter
@Setter
public class VNPAYConfig {

    private String tmnCode;
    private String hashSecret;
    private String payUrl;
    private String returnUrl;

    // 🔥 debug xem có load config không
    @PostConstruct
    public void init() {
        System.out.println("VNPay Config Loaded:");
        System.out.println("tmnCode = " + tmnCode);
        System.out.println("hashSecret = " + hashSecret);
    }

    // 🔐 hash toàn bộ field (dùng verify)
    public String hashAllFields(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder sb = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);

            if (fieldValue != null && fieldValue.length() > 0) {
                sb.append(fieldName).append("=").append(fieldValue);
            }

            if (itr.hasNext()) {
                sb.append("&");
            }
        }

        return hmacSHA512(hashSecret, sb.toString());
    }

    // 🔐 HMAC SHA512
    public String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }

            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");

            hmac512.init(secretKey);

            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);

            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }

            return sb.toString();

        } catch (Exception ex) {
            return "";
        }
    }

    // 🌐 lấy IP client
    public String getIpAddress(HttpServletRequest request) {
        String ipAddress;

        try {
            ipAddress = request.getHeader("X-FORWARDED-FOR");

            if (ipAddress == null || ipAddress.isEmpty()) {
                ipAddress = request.getRemoteAddr();
            }

            if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
                ipAddress = "127.0.0.1";
            }

        } catch (Exception e) {
            ipAddress = "Invalid IP: " + e.getMessage();
        }

        return ipAddress;
    }

    // 🔢 random số
    public String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";

        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }

        return sb.toString();
    }
}
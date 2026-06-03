package com.tuongchinh.Service;

import com.tuongchinh.DTO.*;
import com.tuongchinh.Entity.Voucher;
import com.tuongchinh.Repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherService {
    private final VoucherRepository voucherRepository;

    public List<VoucherResponse> getActiveVouchers() {
        return voucherRepository
                .findByIsActiveTrueAndExpiryDateAfter(LocalDateTime.now())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public VoucherApplyResponse applyVoucher(VoucherApplyRequest request) {
        Voucher voucher = voucherRepository.findByCode(request.getCode())
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        if (!voucher.isValid()) {
            throw new RuntimeException("Voucher đã hết hạn hoặc không còn hiệu lực");
        }
        if (request.getOrderAmount().compareTo(voucher.getMinOrderValue()) < 0) {
            throw new RuntimeException(
                    "Đơn hàng tối thiểu " + voucher.getMinOrderValue() + "đ để dùng voucher này");
        }
        BigDecimal discountAmount = calculateDiscount(voucher, request.getOrderAmount());
        BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount);
        VoucherApplyResponse res = new VoucherApplyResponse();
        res.setCode(voucher.getCode());
        res.setType(voucher.getType());
        res.setDiscountAmount(discountAmount);
        res.setFinalAmount(finalAmount);
        res.setMessage("Áp dụng voucher thành công, giảm " + discountAmount + "đ");
        return res;
    }

    public VoucherResponse create(VoucherRequest request) {
        checkTestCase(request);
        if (voucherRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Mã voucher đã tồn tại");
        }
        Voucher voucher = new Voucher();
        voucher.setCode(request.getCode().trim().toUpperCase());
        voucher.setType(request.getType().toUpperCase());
        voucher.setValue(request.getValue());
        voucher.setMinOrderValue(request.getMinOrderValue());
        voucher.setMaxDiscount(request.getMaxDiscount());
        voucher.setExpiryDate(request.getExpiryDate());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setIsActive(
                request.getIsActive() != null ? request.getIsActive() : true);
        return mapToResponse(voucherRepository.save(voucher));
    }

    public VoucherResponse update(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));

        mapToEntity(voucher, request);
        return mapToResponse(voucherRepository.save(voucher));
    }

    public void delete(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
        voucherRepository.delete(voucher);
    }

    public BigDecimal calculateDiscount(Voucher voucher, BigDecimal orderAmount) {
        BigDecimal discount;
        if ("PERCENT".equals(voucher.getType())) {
            discount = orderAmount
                    .multiply(voucher.getValue())
                    .divide(BigDecimal.valueOf(100));
            if (voucher.getMaxDiscount() != null
                    && discount.compareTo(voucher.getMaxDiscount()) > 0) {
                discount = voucher.getMaxDiscount();
            }
        } else if ("FIXED".equals(voucher.getType())) {
            discount = voucher.getValue();
        } else if ("SHIPPING".equals(voucher.getType())) {
            discount = voucher.getValue();
        } else {
            discount = BigDecimal.ZERO;
        }
        return discount;
    }

    public Voucher validateAndUse(String code, BigDecimal orderAmount) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        if (!voucher.isValid()) {
            throw new RuntimeException("Voucher đã hết hạn hoặc không còn hiệu lực");
        }

        if (orderAmount.compareTo(voucher.getMinOrderValue()) < 0) {
            throw new RuntimeException(
                    "Đơn hàng tối thiểu " + voucher.getMinOrderValue() + "đ");
        }
        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);

        return voucher;
    }

    private void mapToEntity(Voucher voucher, VoucherRequest request) {
        voucher.setCode(request.getCode());
        voucher.setType(request.getType());
        voucher.setValue(request.getValue());
        voucher.setMinOrderValue(request.getMinOrderValue());
        voucher.setMaxDiscount(request.getMaxDiscount());
        voucher.setExpiryDate(request.getExpiryDate());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setIsActive(request.getIsActive());
    }

    private VoucherResponse mapToResponse(Voucher v) {
        VoucherResponse res = new VoucherResponse();
        res.setId(v.getId());
        res.setCode(v.getCode());
        res.setType(v.getType());
        res.setValue(v.getValue());
        res.setMinOrderValue(v.getMinOrderValue());
        res.setMaxDiscount(v.getMaxDiscount());
        res.setExpiryDate(v.getExpiryDate());
        res.setUsageLimit(v.getUsageLimit());
        res.setUsedCount(v.getUsedCount());
        res.setIsActive(v.getIsActive());
        return res;
    }
    private void checkTestCase(VoucherRequest request) {

        if (request == null) {
            throw new RuntimeException("Request không được null");
        }

        // code
        if (request.getCode() == null
                || request.getCode().trim().isEmpty()) {

            throw new RuntimeException("Mã voucher không được để trống");
        }

        if (request.getCode().length() > 50) {
            throw new RuntimeException("Mã voucher quá dài");
        }

        // type
        List<String> validTypes =
                List.of("PERCENT", "FIXED", "SHIPPING");

        if (request.getType() == null
                || !validTypes.contains(request.getType())) {

            throw new RuntimeException("Loại voucher không hợp lệ");
        }

        // value
        if (request.getValue() == null
                || request.getValue().compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException("Giá trị voucher phải lớn hơn 0");
        }

        // percent <= 100
        if ("PERCENT".equals(request.getType())
                && request.getValue().compareTo(BigDecimal.valueOf(100)) > 0) {

            throw new RuntimeException("Voucher phần trăm không được vượt quá 100%");
        }

        // minOrderValue
        if (request.getMinOrderValue() != null
                && request.getMinOrderValue().compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException("Đơn tối thiểu không hợp lệ");
        }

        // maxDiscount
        if (request.getMaxDiscount() != null
                && request.getMaxDiscount().compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException("Giảm tối đa không hợp lệ");
        }

        // expiryDate
        if (request.getExpiryDate() == null) {
            throw new RuntimeException("Ngày hết hạn không được để trống");
        }

        if (!request.getExpiryDate().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Voucher đã hết hạn");
        }

        // usageLimit
        if (request.getUsageLimit() != null
                && request.getUsageLimit() <= 0) {

            throw new RuntimeException("Giới hạn sử dụng không hợp lệ");
        }
    }
}
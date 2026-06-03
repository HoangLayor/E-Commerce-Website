package com.tuongchinh.Service;

import com.tuongchinh.Entity.Order;
import com.tuongchinh.Entity.OrderItem;
import com.tuongchinh.Repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.OutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderExportService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public void exportOrdersToExcel(OutputStream os) throws IOException {
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Danh sách Đơn hàng");

        // Define styling
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 11);
        headerFont.setColor(IndexedColors.WHITE.getIndex());

        CellStyle headerCellStyle = workbook.createCellStyle();
        headerCellStyle.setFont(headerFont);
        headerCellStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerCellStyle.setBorderBottom(BorderStyle.THIN);
        headerCellStyle.setBorderTop(BorderStyle.THIN);
        headerCellStyle.setBorderRight(BorderStyle.THIN);
        headerCellStyle.setBorderLeft(BorderStyle.THIN);
        headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

        CellStyle cellStyle = workbook.createCellStyle();
        cellStyle.setBorderBottom(BorderStyle.THIN);
        cellStyle.setBorderTop(BorderStyle.THIN);
        cellStyle.setBorderRight(BorderStyle.THIN);
        cellStyle.setBorderLeft(BorderStyle.THIN);
        cellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        // Styling for multiline text (product details)
        CellStyle wrapStyle = workbook.createCellStyle();
        wrapStyle.cloneStyleFrom(cellStyle);
        wrapStyle.setWrapText(true);

        String[] columns = {
                "Mã Đơn Hàng", "Ngày Đặt", "Người Nhận", "Số Điện Thoại",
                "Địa Chỉ Giao Hàng", "PT Thanh Toán", "TT Thanh Toán",
                "TT Đơn Hàng", "Mã Giảm Giá", "Tiền Giảm (đ)", "Tổng Tiền (đ)", "Chi Tiết Sản Phẩm"
        };

        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerCellStyle);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        int rowIdx = 1;
        for (Order order : orders) {
            Row row = sheet.createRow(rowIdx++);

            // Mã đơn hàng
            Cell c0 = row.createCell(0);
            c0.setCellValue("#" + order.getId());
            c0.setCellStyle(cellStyle);

            // Ngày đặt
            Cell c1 = row.createCell(1);
            c1.setCellValue(order.getOrderDate() != null ? order.getOrderDate().format(formatter) : "");
            c1.setCellStyle(cellStyle);

            // Người nhận
            Cell c2 = row.createCell(2);
            c2.setCellValue(order.getReceiverName() != null ? order.getReceiverName() : "");
            c2.setCellStyle(cellStyle);

            // Số điện thoại
            Cell c3 = row.createCell(3);
            c3.setCellValue(order.getPhone() != null ? order.getPhone() : "");
            c3.setCellStyle(cellStyle);

            // Địa chỉ nhận hàng
            Cell c4 = row.createCell(4);
            c4.setCellValue(order.getAddress() != null && order.getAddress().getAddress() != null ? order.getAddress().getAddress() : "");
            c4.setCellStyle(cellStyle);

            // PTTT
            Cell c5 = row.createCell(5);
            c5.setCellValue(order.getPaymentMethod() != null ? order.getPaymentMethod() : "");
            c5.setCellStyle(cellStyle);

            // TT Thanh Toán (Status)
            Cell c6 = row.createCell(6);
            c6.setCellValue(order.getStatus() != null ? translatePaymentStatus(order.getStatus()) : "");
            c6.setCellStyle(cellStyle);

            // TT Đơn hàng (OrderStatus)
            Cell c7 = row.createCell(7);
            c7.setCellValue(order.getOrderStatus() != null ? translateOrderStatus(order.getOrderStatus()) : "");
            c7.setCellStyle(cellStyle);

            // Mã giảm giá
            Cell c8 = row.createCell(8);
            c8.setCellValue(order.getVoucher() != null && order.getVoucher().getCode() != null ? order.getVoucher().getCode() : "");
            c8.setCellStyle(cellStyle);

            // Tiền giảm giá
            Cell c9 = row.createCell(9);
            c9.setCellValue(order.getDiscountAmount() != null ? order.getDiscountAmount().doubleValue() : 0.0);
            c9.setCellStyle(cellStyle);

            // Tổng tiền
            Cell c10 = row.createCell(10);
            c10.setCellValue(order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0);
            c10.setCellStyle(cellStyle);

            // Chi tiết sản phẩm
            StringBuilder productDetails = new StringBuilder();
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    if (productDetails.length() > 0) {
                        productDetails.append("\n");
                    }
                    String prodName = item.getVariant() != null && item.getVariant().getProduct() != null 
                            ? item.getVariant().getProduct().getName() : "Không rõ";
                    String skuStr = item.getVariant() != null && item.getVariant().getSku() != null 
                            ? " [" + item.getVariant().getSku() + "]" : "";
                    productDetails.append("- ").append(prodName).append(skuStr)
                            .append(" (x").append(item.getQuantity())
                            .append(" - ").append(item.getPrice()).append("đ)");
                }
            }
            Cell c11 = row.createCell(11);
            c11.setCellValue(productDetails.toString());
            c11.setCellStyle(wrapStyle);
        }

        // Auto-size columns to look nice
        for (int i = 0; i < columns.length; i++) {
            if (i == 11) {
                sheet.setColumnWidth(i, 15000); // Set fixed wide column for products list
            } else if (i == 4) {
                sheet.setColumnWidth(i, 12000); // Fixed wide for address
            } else {
                sheet.autoSizeColumn(i);
            }
        }

        workbook.write(os);
        workbook.close();
    }

    private String translatePaymentStatus(String status) {
        if ("PAID".equalsIgnoreCase(status)) return "Đã thanh toán";
        if ("PENDING".equalsIgnoreCase(status)) return "Chờ thanh toán";
        if ("REFUNDED".equalsIgnoreCase(status)) return "Đã hoàn tiền";
        return status;
    }

    private String translateOrderStatus(String status) {
        if ("PENDING".equalsIgnoreCase(status)) return "Chờ xử lý";
        if ("PROCESSING".equalsIgnoreCase(status)) return "Đang xử lý";
        if ("SHIPPED".equalsIgnoreCase(status)) return "Đang giao";
        if ("DELIVERED".equalsIgnoreCase(status)) return "Đã giao";
        if ("CANCELLED".equalsIgnoreCase(status)) return "Đã hủy";
        return status;
    }
}

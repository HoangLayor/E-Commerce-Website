package com.tuongchinh.Service;

import com.tuongchinh.DTO.ReportResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;

@Service
@RequiredArgsConstructor
public class ReportExportService {

    private final ReportService reportService;

    public void exportReportSummaryToExcel(OutputStream os) throws IOException {
        ReportResponse report = reportService.getSummaryReport();
        Workbook workbook = new XSSFWorkbook();

        // 1. STYLING DEF
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 11);
        headerFont.setColor(IndexedColors.WHITE.getIndex());

        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.TEAL.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);

        CellStyle cellStyle = workbook.createCellStyle();
        cellStyle.setBorderBottom(BorderStyle.THIN);
        cellStyle.setBorderTop(BorderStyle.THIN);
        cellStyle.setBorderRight(BorderStyle.THIN);
        cellStyle.setBorderLeft(BorderStyle.THIN);
        cellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        CellStyle boldCellStyle = workbook.createCellStyle();
        boldCellStyle.cloneStyleFrom(cellStyle);
        Font boldFont = workbook.createFont();
        boldFont.setBold(true);
        boldCellStyle.setFont(boldFont);

        // --- SHEET 1: TỔNG QUAN ---
        Sheet s1 = workbook.createSheet("Tổng quan");
        Row h1 = s1.createRow(0);
        
        Cell hc1 = h1.createCell(0); hc1.setCellValue("Chỉ số doanh nghiệp"); hc1.setCellStyle(headerStyle);
        Cell hc2 = h1.createCell(1); hc2.setCellValue("Giá trị thực tế"); hc2.setCellStyle(headerStyle);

        Object[][] overviewData = {
                {"Tổng doanh thu (đ)", report.getTotalRevenue() != null ? report.getTotalRevenue().doubleValue() : 0.0},
                {"Tổng số đơn hàng", (double) report.getTotalOrders()},
                {"Tổng số khách hàng (User)", (double) report.getTotalCustomers()},
                {"Tổng số mặt hàng trong kho", (double) report.getTotalProducts()}
        };

        for (int i = 0; i < overviewData.length; i++) {
            Row r = s1.createRow(i + 1);
            Cell cellLabel = r.createCell(0);
            cellLabel.setCellValue((String) overviewData[i][0]);
            cellLabel.setCellStyle(cellStyle);

            Cell cellVal = r.createCell(1);
            cellVal.setCellValue((Double) overviewData[i][1]);
            cellVal.setCellStyle(boldCellStyle);
        }
        s1.autoSizeColumn(0);
        s1.autoSizeColumn(1);

        // --- SHEET 2: DOANH THU HÀNG NGÀY ---
        Sheet s2 = workbook.createSheet("Doanh thu 7 ngày qua");
        Row h2 = s2.createRow(0);
        Cell hc2_1 = h2.createCell(0); hc2_1.setCellValue("Ngày"); hc2_1.setCellStyle(headerStyle);
        Cell hc2_2 = h2.createCell(1); hc2_2.setCellValue("Doanh thu (đ)"); hc2_2.setCellStyle(headerStyle);
        Cell hc2_3 = h2.createCell(2); hc2_3.setCellValue("Số đơn hàng"); hc2_3.setCellStyle(headerStyle);

        int rowIdx = 1;
        if (report.getRevenueChart() != null) {
            for (ReportResponse.DailyRevenue item : report.getRevenueChart()) {
                Row r = s2.createRow(rowIdx++);
                Cell c0 = r.createCell(0); c0.setCellValue(item.getDate()); c0.setCellStyle(cellStyle);
                Cell c1 = r.createCell(1); c1.setCellValue(item.getRevenue() != null ? item.getRevenue().doubleValue() : 0.0); c1.setCellStyle(cellStyle);
                Cell c2 = r.createCell(2); c2.setCellValue((double) item.getOrders()); c2.setCellStyle(cellStyle);
            }
        }
        s2.autoSizeColumn(0);
        s2.autoSizeColumn(1);
        s2.autoSizeColumn(2);

        // --- SHEET 3: TOP SẢN PHẨM ---
        Sheet s3 = workbook.createSheet("Top sản phẩm bán chạy");
        Row h3 = s3.createRow(0);
        Cell hc3_1 = h3.createCell(0); hc3_1.setCellValue("Thứ hạng"); hc3_1.setCellStyle(headerStyle);
        Cell hc3_2 = h3.createCell(1); hc3_2.setCellValue("Tên sản phẩm"); hc3_2.setCellStyle(headerStyle);
        Cell hc3_3 = h3.createCell(2); hc3_3.setCellValue("Số lượng đã bán"); hc3_3.setCellStyle(headerStyle);
        Cell hc3_4 = h3.createCell(3); hc3_4.setCellValue("Doanh thu (đ)"); hc3_4.setCellStyle(headerStyle);

        rowIdx = 1;
        if (report.getTopProducts() != null) {
            for (int i = 0; i < report.getTopProducts().size(); i++) {
                ReportResponse.TopProduct item = report.getTopProducts().get(i);
                Row r = s3.createRow(rowIdx++);
                Cell c0 = r.createCell(0); c0.setCellValue("Top " + (i + 1)); c0.setCellStyle(cellStyle);
                Cell c1 = r.createCell(1); c1.setCellValue(item.getName()); c1.setCellStyle(cellStyle);
                Cell c2 = r.createCell(2); c2.setCellValue((double) item.getSales()); c2.setCellStyle(cellStyle);
                Cell c3 = r.createCell(3); c3.setCellValue(item.getRevenue() != null ? item.getRevenue().doubleValue() : 0.0); c3.setCellStyle(cellStyle);
            }
        }
        s3.autoSizeColumn(0);
        s3.setColumnWidth(1, 12000); // Fixed wide for product names
        s3.autoSizeColumn(2);
        s3.autoSizeColumn(3);

        // --- SHEET 4: CƠ CẤU DOANH THU ---
        Sheet s4 = workbook.createSheet("Cơ cấu danh mục & nhãn hàng");
        
        // Table 1: Category
        Row h4_1 = s4.createRow(0);
        Cell hc4_1 = h4_1.createCell(0); hc4_1.setCellValue("Tên danh mục"); hc4_1.setCellStyle(headerStyle);
        Cell hc4_2 = h4_1.createCell(1); hc4_2.setCellValue("Tỷ lệ (%)"); hc4_2.setCellStyle(headerStyle);

        rowIdx = 1;
        if (report.getCategoryChart() != null) {
            for (ReportResponse.CategorySales item : report.getCategoryChart()) {
                Row r = s4.createRow(rowIdx++);
                Cell c0 = r.createCell(0); c0.setCellValue(item.getName()); c0.setCellStyle(cellStyle);
                Cell c1 = r.createCell(1); c1.setCellValue(item.getValue()); c1.setCellStyle(cellStyle);
            }
        }

        // Table 2: Brand (Leave a space of 2 rows)
        rowIdx += 2;
        Row h4_2 = s4.createRow(rowIdx++);
        Cell hc4_3 = h4_2.createCell(0); hc4_3.setCellValue("Tên thương hiệu"); hc4_3.setCellStyle(headerStyle);
        Cell hc4_4 = h4_2.createCell(1); hc4_4.setCellValue("Tỷ lệ (%)"); hc4_4.setCellStyle(headerStyle);

        if (report.getBrandChart() != null) {
            for (ReportResponse.BrandSales item : report.getBrandChart()) {
                Row r = s4.createRow(rowIdx++);
                Cell c0 = r.createCell(0); c0.setCellValue(item.getName()); c0.setCellStyle(cellStyle);
                Cell c1 = r.createCell(1); c1.setCellValue(item.getValue()); c1.setCellStyle(cellStyle);
            }
        }
        s4.autoSizeColumn(0);
        s4.autoSizeColumn(1);

        workbook.write(os);
        workbook.close();
    }
}

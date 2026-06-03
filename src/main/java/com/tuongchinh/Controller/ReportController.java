package com.tuongchinh.Controller;

import com.tuongchinh.DTO.ReportResponse;
import com.tuongchinh.Service.ReportService;
import com.tuongchinh.Service.ReportExportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@CrossOrigin
public class ReportController {
    private final ReportService reportService;
    private final ReportExportService reportExportService;

    @GetMapping("/summary")
    public ResponseEntity<ReportResponse> getSummary() {
        return ResponseEntity.ok(reportService.getSummaryReport());
    }

    @GetMapping("/export")
    public void exportSummary(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=business_report.xlsx");
        reportExportService.exportReportSummaryToExcel(response.getOutputStream());
    }
}

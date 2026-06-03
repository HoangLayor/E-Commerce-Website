package com.tuongchinh.Service;

import com.tuongchinh.Entity.Brand;
import com.tuongchinh.Entity.Category;
import com.tuongchinh.Entity.Product;
import com.tuongchinh.Entity.ProductVariant;
import com.tuongchinh.Repository.BrandRepository;
import com.tuongchinh.Repository.CategoryRepository;
import com.tuongchinh.Repository.ProductRepository;
import com.tuongchinh.Repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImportExportService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    @Transactional(readOnly = true)
    public void exportToExcel(OutputStream os) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Products");

        // Header style
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        // Header row
        String[] headers = {
            "Product ID", "Product Name", "Description", "Category ID", "Category Name", 
            "Brand ID", "Brand Name", "Variant ID", "SKU", "Price", 
            "Compare At Price", "Cost Price", "Stock", "Active"
        };

        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        List<Product> products = productRepository.findAll();
        int rowIdx = 1;

        for (Product product : products) {
            List<ProductVariant> variants = product.getVariants();
            if (variants == null || variants.isEmpty()) {
                Row row = sheet.createRow(rowIdx++);
                writeProductInfo(row, product);
            } else {
                for (ProductVariant variant : variants) {
                    Row row = sheet.createRow(rowIdx++);
                    writeProductInfo(row, product);
                    writeVariantInfo(row, variant);
                }
            }
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        workbook.write(os);
        workbook.close();
    }

    private void writeProductInfo(Row row, Product product) {
        row.createCell(0).setCellValue(product.getId());
        row.createCell(1).setCellValue(product.getName() != null ? product.getName() : "");
        row.createCell(2).setCellValue(product.getDescription() != null ? product.getDescription() : "");
        
        if (product.getCategory() != null) {
            row.createCell(3).setCellValue(product.getCategory().getId());
            row.createCell(4).setCellValue(product.getCategory().getName() != null ? product.getCategory().getName() : "");
        }
        
        if (product.getBrand() != null) {
            row.createCell(5).setCellValue(product.getBrand().getId());
            row.createCell(6).setCellValue(product.getBrand().getName() != null ? product.getBrand().getName() : "");
        }
    }

    private void writeVariantInfo(Row row, ProductVariant variant) {
        row.createCell(7).setCellValue(variant.getId());
        row.createCell(8).setCellValue(variant.getSku() != null ? variant.getSku() : "");
        row.createCell(9).setCellValue(variant.getPrice() != null ? variant.getPrice().doubleValue() : 0.0);
        row.createCell(10).setCellValue(variant.getCompareAtPrice() != null ? variant.getCompareAtPrice().doubleValue() : 0.0);
        row.createCell(11).setCellValue(variant.getCostPrice() != null ? variant.getCostPrice().doubleValue() : 0.0);
        row.createCell(12).setCellValue(variant.getStock() != null ? variant.getStock() : 0);
        row.createCell(13).setCellValue(variant.getIsActive() != null ? variant.getIsActive() : true);
    }

    @Transactional
    public void importFromExcel(InputStream is) throws IOException {
        Workbook workbook = new XSSFWorkbook(is);
        Sheet sheet = workbook.getSheetAt(0);
        Iterator<Row> rows = sheet.iterator();

        // Skip header
        if (rows.hasNext()) {
            rows.next();
        }

        java.util.Set<String> processedSkus = new java.util.HashSet<>();

        while (rows.hasNext()) {
            Row currentRow = rows.next();
            if (isRowEmpty(currentRow)) {
                continue;
            }

            int rowNum = currentRow.getRowNum() + 1; // 1-based index for friendly message

            // Read product info
            Long productId = getLongCellValue(currentRow.getCell(0));
            String productName = getStringCellValue(currentRow.getCell(1));
            String description = getStringCellValue(currentRow.getCell(2));
            Long categoryId = getLongCellValue(currentRow.getCell(3));
            Long brandId = getLongCellValue(currentRow.getCell(5));

            if (productName == null || productName.trim().isEmpty()) {
                throw new RuntimeException("Dòng " + rowNum + ": Tên sản phẩm không được để trống");
            }

            Product product;
            if (productId != null) {
                product = productRepository.findById(productId)
                        .orElseThrow(() -> new RuntimeException("Dòng " + rowNum + ": Không tìm thấy Sản phẩm có ID = " + productId));
            } else {
                product = new Product();
            }

            product.setName(productName);
            product.setDescription(description);

            if (categoryId != null) {
                Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("Dòng " + rowNum + ": Danh mục có ID = " + categoryId + " không tồn tại"));
                product.setCategory(category);
            } else {
                product.setCategory(null);
            }

            if (brandId != null) {
                Brand brand = brandRepository.findById(brandId)
                        .orElseThrow(() -> new RuntimeException("Dòng " + rowNum + ": Thương hiệu có ID = " + brandId + " không tồn tại"));
                product.setBrand(brand);
            } else {
                product.setBrand(null);
            }

            // Save product to get ID if new
            product = productRepository.save(product);

            // Read variant info
            Long variantId = getLongCellValue(currentRow.getCell(7));
            String sku = getStringCellValue(currentRow.getCell(8));
            BigDecimal price = getBigDecimalCellValue(currentRow.getCell(9));
            BigDecimal compareAtPrice = getBigDecimalCellValue(currentRow.getCell(10));
            BigDecimal costPrice = getBigDecimalCellValue(currentRow.getCell(11));
            Integer stock = getIntegerCellValue(currentRow.getCell(12));
            Boolean isActive = getBooleanCellValue(currentRow.getCell(13));

            if (sku != null && !sku.trim().isEmpty()) {
                sku = sku.trim();
                
                // Prevent duplicate SKUs in the same excel file import session
                if (processedSkus.contains(sku)) {
                    throw new RuntimeException("Dòng " + rowNum + ": Mã SKU '" + sku + "' bị trùng lặp trong file Excel");
                }
                processedSkus.add(sku);

                ProductVariant variant;
                if (variantId != null) {
                    variant = productVariantRepository.findById(variantId)
                            .orElseThrow(() -> new RuntimeException("Dòng " + rowNum + ": Không tìm thấy Biến thể có ID = " + variantId));
                    
                    // Safe guard: variant must belong to the matching product
                    if (variant.getProduct() != null && !variant.getProduct().getId().equals(product.getId())) {
                        throw new RuntimeException("Dòng " + rowNum + ": Biến thể ID = " + variantId + " đang thuộc về Sản phẩm ID = " + variant.getProduct().getId() + ", không thể đổi sang Sản phẩm ID = " + product.getId());
                    }
                } else {
                    // Try to look up by SKU to avoid duplicates
                    variant = productVariantRepository.findBySku(sku).orElse(new ProductVariant());
                    if (variant.getId() != null && variant.getProduct() != null && !variant.getProduct().getId().equals(product.getId())) {
                        throw new RuntimeException("Dòng " + rowNum + ": Mã SKU '" + sku + "' đã tồn tại và thuộc về Sản phẩm ID = " + variant.getProduct().getId() + ", không thể gán lại.");
                    }
                }

                // Strict validations for price and stock
                if (price != null && price.compareTo(BigDecimal.ZERO) < 0) {
                    throw new RuntimeException("Dòng " + rowNum + ": Giá bán không được phép nhỏ hơn 0");
                }
                if (compareAtPrice != null && compareAtPrice.compareTo(BigDecimal.ZERO) < 0) {
                    throw new RuntimeException("Dòng " + rowNum + ": Giá so sánh không được phép nhỏ hơn 0");
                }
                if (costPrice != null && costPrice.compareTo(BigDecimal.ZERO) < 0) {
                    throw new RuntimeException("Dòng " + rowNum + ": Giá nhập không được phép nhỏ hơn 0");
                }
                if (stock != null && stock < 0) {
                    throw new RuntimeException("Dòng " + rowNum + ": Số lượng tồn kho không được phép nhỏ hơn 0");
                }

                variant.setProduct(product);
                variant.setSku(sku);
                variant.setPrice(price != null ? price : BigDecimal.ZERO);
                variant.setCompareAtPrice(compareAtPrice);
                variant.setCostPrice(costPrice);
                variant.setStock(stock != null ? stock : 0);
                variant.setIsActive(isActive != null ? isActive : true);

                productVariantRepository.save(variant);
            }
        }

        workbook.close();
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    private String getStringCellValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            // Check if it's an integer stored as float/double
            double val = cell.getNumericCellValue();
            if (val == (long) val) {
                return String.valueOf((long) val);
            }
            return String.valueOf(val);
        } else if (cell.getCellType() == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        }
        return null;
    }

    private Long getLongCellValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return (long) cell.getNumericCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                return Long.parseLong(cell.getStringCellValue().trim());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private Integer getIntegerCellValue(Cell cell) {
        Long val = getLongCellValue(cell);
        return val != null ? val.intValue() : null;
    }

    private BigDecimal getBigDecimalCellValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                return new BigDecimal(cell.getStringCellValue().trim());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private Boolean getBooleanCellValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.BOOLEAN) {
            return cell.getBooleanCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            return Boolean.parseBoolean(cell.getStringCellValue().trim());
        } else if (cell.getCellType() == CellType.NUMERIC) {
            return cell.getNumericCellValue() != 0;
        }
        return null;
    }
}

# 🌸 GlowSkin – Website Thương Mại Điện Tử Mỹ Phẩm

> **GlowSkin** là website thương mại điện tử chuyên về mỹ phẩm chính hãng, được xây dựng với giao diện hiện đại, nữ tính và thân thiện người dùng.

---

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt & Chạy dự án](#cài-đặt--chạy-dự-án)
- [Các tính năng chính](#các-tính-năng-chính)
- [Tác giả](#tác-giả)

---

## Giới thiệu

**GlowSkin** cung cấp trải nghiệm mua sắm mỹ phẩm trực tuyến với đầy đủ các chức năng: duyệt sản phẩm, tìm kiếm, giỏ hàng, thanh toán, quản lý tài khoản, và trang quản trị dành cho admin.

Thiết kế lấy tông màu **Rose Gold (#B76E79)** làm chủ đạo, mang lại cảm giác sang trọng và nữ tính.

---

## Công nghệ sử dụng

| Công nghệ | Phiên bản | Mô tả |
|---|---|---|
| **Next.js** | 16.0.10 | React framework với App Router |
| **React** | 19.2.0 | Thư viện UI |
| **TypeScript** | 5.x | Ngôn ngữ lập trình |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **shadcn/ui** | — | Component library (Radix UI) |
| **Lucide React** | 0.454.0 | Bộ icon |
| **React Hook Form + Zod** | — | Form handling & validation |
| **Recharts** | 2.15.4 | Biểu đồ thống kê (Admin) |
| **Embla Carousel** | 8.6.0 | Carousel/Slider |
| **pnpm** | — | Package manager |

---

## Cấu trúc dự án

```
e_commerce_FE/
├── app/                    # App Router - Các trang
│   ├── layout.tsx          # Layout chính
│   ├── page.tsx            # Trang chủ
│   ├── about/              # Giới thiệu
│   ├── account/            # Tài khoản (đăng nhập, đơn hàng, địa chỉ, voucher)
│   ├── admin/              # Trang quản trị
│   ├── cart/               # Giỏ hàng
│   ├── category/[slug]/    # Danh mục sản phẩm
│   ├── checkout/           # Thanh toán & thành công
│   ├── contact/            # Liên hệ
│   ├── events/             # Sự kiện khuyến mãi
│   ├── product/[slug]/     # Chi tiết sản phẩm
│   ├── products/           # Danh sách sản phẩm
│   ├── promotions/         # Khuyến mãi
│   └── sale/               # Flash sale
├── components/             # Các component tái sử dụng
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Header, Footer
│   ├── home/               # Các section trang chủ
│   ├── product/            # Product card, Product detail
│   ├── cart/               # Giỏ hàng
│   ├── checkout/           # Thanh toán
│   ├── account/            # Sidebar tài khoản
│   ├── admin/              # Sidebar admin
│   ├── chatbot/            # Chatbot widget
│   └── promotions/         # Nút copy mã giảm giá
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities & dữ liệu mẫu
├── public/                 # Tài nguyên tĩnh (ảnh, icon)
└── styles/                 # Global styles
```

---

## Cài đặt & Chạy dự án

### Yêu cầu

- **Node.js** >= 18.x
- **pnpm** (khuyến nghị)

### Các bước

1. **Clone repository:**

   ```bash
   git clone <repository-url>
   cd e_commerce_FE
   ```

2. **Cài đặt dependencies:**

   ```bash
   pnpm install
   ```

3. **Chạy development server:**

   ```bash
   pnpm dev
   ```

4. **Mở trình duyệt:** [http://localhost:3000](http://localhost:3000)

### Các lệnh khác

| Lệnh | Mô tả |
|---|---|
| `pnpm dev` | Chạy development server |
| `pnpm build` | Build production |
| `pnpm start` | Chạy production server |
| `pnpm lint` | Kiểm tra lỗi ESLint |

---

## Các tính năng chính

### 🛍️ Khách hàng
- **Trang chủ**: Hero banner, Flash Sale, sản phẩm nổi bật, danh mục, đánh giá khách hàng
- **Danh sách sản phẩm**: Lọc theo danh mục, giá, sắp xếp
- **Chi tiết sản phẩm**: Gallery ảnh, mô tả, đánh giá, sản phẩm liên quan
- **Giỏ hàng**: Thêm/xóa/cập nhật số lượng, mã giảm giá
- **Thanh toán**: Quy trình 3 bước (thông tin giao hàng → vận chuyển → thanh toán)
- **Tài khoản**: Đăng nhập/đăng ký, quản lý đơn hàng, địa chỉ, voucher
- **Chatbot**: Hỗ trợ tư vấn trực tuyến

### 🔧 Quản trị (Admin)
- Quản lý sản phẩm
- Quản lý đơn hàng
- Quản lý khách hàng
- Quản lý khuyến mãi
- Báo cáo thống kê
- Cài đặt hệ thống

---

## Tác giả

Dự án được phát triển trong khuôn khổ môn học **Phát triển Website Thương Mại Điện Tử** – Học kỳ 8.

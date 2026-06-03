<div align="center">
  <img src="https://ui-avatars.com/api/?name=GlowSkin&background=ffb3c6&color=fff&size=200&font-size=0.33&bold=true" alt="GlowSkin Logo" width="150" />
  
  # GlowSkin - E-Commerce Platform
  
  **Hệ thống Thương mại điện tử Bán lẻ Mỹ phẩm Toàn diện & Thông minh**

  [![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=java&logoColor=white)](https://www.java.com/)
  [![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
  [![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
</div>

---

## 📖 Giới thiệu (Overview)

**GlowSkin** là một nền tảng thương mại điện tử chuyên cung cấp và bán lẻ mỹ phẩm, được xây dựng theo kiến trúc phân tán (Micro-Frontend / Monolithic Backend) hiện đại. Dự án tập trung vào trải nghiệm người dùng tối ưu (UX/UI) và khả năng quản lý mạnh mẽ, kết hợp cùng hệ thống RAG (Retrieval-Augmented Generation) thông minh để phát hiện gian lận và hỗ trợ phân tích dữ liệu.

Đây là đồ án phục vụ môn học **Phát triển Website Thương mại điện tử**.

## ✨ Tính năng nổi bật (Key Features)

### 🛍️ Client (Khách hàng)
- **Trải nghiệm mua sắm mượt mà:** Giao diện tối ưu, thiết kế sang trọng, tích hợp Animation mượt mà.
- **Thanh toán đa dạng:** Hỗ trợ thanh toán qua **VNPay**, MoMo, Thẻ tín dụng, và COD.
- **Khuyến mãi & Voucher:** Hệ thống mã giảm giá theo điều kiện giỏ hàng, tự động tính toán phí ship.
- **Quản lý tài khoản cá nhân:** Theo dõi trạng thái đơn hàng (Đang xử lý, Đang giao, Đã giao...).

### 🛡️ Admin Dashboard (Quản trị viên)
- **Thống kê chuyên sâu:** Biểu đồ doanh thu, báo cáo tổng quan.
- **Quản lý toàn diện:** Sản phẩm, Đơn hàng, Người dùng, Danh mục, Flash Sale.
- **Hệ thống cảnh báo:** Tích hợp phát hiện đơn hàng rủi ro thông qua AI / RAG Service.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Backend (Core API)
- **Framework:** Spring Boot 3.2.5 (Java 17)
- **Database & ORM:** MySQL 8, Spring Data JPA, Hibernate
- **Security:** Spring Security, JWT (JSON Web Tokens)
- **Storage & Payment:** Cloudinary (Lưu trữ ảnh), VNPay API
- **Tooling:** Maven, Lombok

### Frontend (Client & Admin)
- **Framework:** Next.js 16 (App Router), React 19
- **Ngôn ngữ:** TypeScript
- **Styling & UI:** Tailwind CSS 4, shadcn/ui, Radix UI, Framer Motion
- **Tooling:** pnpm

### AI / Data Services
- **Service:** RAG Service (Python) phân tích thông tin & phát hiện gian lận.

---

## 📂 Cấu trúc dự án (Architecture)

```text
PHATTRIENWEBSITETHUONGMAIDIENTU/
├── src/                    # ⚙️ Nguồn Backend (Spring Boot Java)
│   ├── main/java/.../      # Các Controller, Service, Entity, Repository
│   └── main/resources/     # Cấu hình application.properties
├── ecommerce/              # 💻 Nguồn Frontend (Next.js Workspace)
│   ├── client/             # Trang mua sắm của Khách hàng (Port 3000)
│   └── admin/              # Trang quản trị dành cho Admin (Port 3001)
├── rag_service/            # 🧠 Dịch vụ AI/RAG bằng Python
├── webhook_service/        # 🔗 Dịch vụ xử lý Webhook
└── pom.xml                 # 📦 Quản lý dependencies cho Backend
```

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án (Getting Started)

### 📌 Yêu cầu hệ thống (Prerequisites)
- JDK 17+
- Maven 3.9+
- Node.js 18+ & `pnpm`
- Python 3.10+ (cho RAG service)
- MySQL 8

### 1. Khởi động Backend (Spring Boot)
1. Cấu hình Database trong `src/main/resources/application.properties`.
2. Mở terminal tại thư mục gốc và chạy:
```bash
mvn clean install -DskipTests
mvn spring-boot:run
```
> Backend mặc định sẽ khởi chạy tại cổng `http://localhost:8081`.

### 2. Khởi động Frontend (Client & Admin)
Mở terminal mới, cài đặt dependencies và chạy server:
```bash
# Cài đặt dependencies cho cả Client và Admin
cd ecommerce/client && pnpm install
cd ../admin && pnpm install

# Chạy song song cả hai project
# Terminal 1 (Client):
cd ecommerce/client && pnpm dev

# Terminal 2 (Admin):
cd ecommerce/admin && pnpm dev
```
> - **Client:** truy cập tại `http://localhost:3000`
> - **Admin:** truy cập tại `http://localhost:3001`

---

## 🌐 Môi trường (Environment Variables)

Khi deploy, bạn cần cấu hình lại các file `.env` tại thư mục frontend (`ecommerce/client/.env` và `ecommerce/admin/.env`):
```env
NEXT_PUBLIC_API_BASE_URL=https://api.domaincuaban.com
NEXT_PUBLIC_ADMIN_URL=https://admin.domaincuaban.com
```

---

## 🤝 Đóng góp (Contributing)

Mọi đóng góp, báo lỗi, hoặc cải tiến tính năng đều được hoan nghênh. Xin vui lòng tạo Issue hoặc Gửi Pull Request trực tiếp.

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=hoanglayor/E-Commerce-Website&type=Date)](https://star-history.com/#hoanglayor/E-Commerce-Website&Date)

<br/>
<div align="center">
  <i>Được phát triển với ❤️ cho môn học Phát triển Website Thương mại điện tử</i>
</div>

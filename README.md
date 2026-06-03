# PHATTRIENWEBSITETHUONGMAIDIENTU

Dự án website thương mại điện tử gồm 2 phần:
- Backend: Spring Boot (Java 17, Maven)
- Frontend: Next.js 16 + TypeScript + Tailwind CSS

## Cấu trúc thư mục

```text
PHATTRIENWEBSITETHUONGMAIDIENTU/
|- src/                    # Mã nguồn backend (Spring Boot)
|- pom.xml                 # Cấu hình Maven backend
|- e_commerce_FE/          # Frontend (Next.js)
|  |- app/
|  |- components/
|  |- lib/
|  |- package.json
|  |- README.md
|- README.md
```

## Công nghệ sử dụng

### Backend
- Java 17
- Spring Boot 3.2.5
- Spring Web, Spring Data JPA, Spring Security
- MySQL Connector
- JWT (jjwt)
- Cloudinary
- Maven

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui + Radix UI
- pnpm

## Yêu cầu môi trường

- JDK 17+
- Maven 3.9+
- Node.js 18+
- pnpm
- MySQL

## Hướng dẫn chạy dự án

### 1. Chạy backend

Tại thư mục gốc:

```bash
mvn spring-boot:run
```

Backend mặc định sẽ chạy ở cổng `8080` (nếu không đổi trong `application.properties`).

### 2. Chạy frontend

Mở terminal mới, di chuyển vào thư mục frontend:

```bash
cd e_commerce_FE
pnpm install
pnpm dev
```

Frontend mặc định chạy ở `http://localhost:3000`.

## Build production

### Backend

```bash
mvn clean package
```

### Frontend

```bash
cd e_commerce_FE
pnpm build
pnpm start
```

## Ghi chú

- Cấu hình kết nối database và các biến môi trường đặt trong `src/main/resources/application.properties` (backend) và file `.env*` (frontend nếu cần).
- Thư mục build/runtime (`target`, `.next`, `node_modules`) đã được khai báo ignore trong `.gitignore`.

## Tác giả

Dự án phục vụ môn học Phát triển Website Thương mại điện tử.

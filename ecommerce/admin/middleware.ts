import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Đọc cookie 'token' để kiểm tra trạng thái đăng nhập
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // Nếu chưa đăng nhập, đá về trang Login của Client
    // Ưu tiên dùng NEXT_PUBLIC_STORE_URL nếu đã cấu hình
    const baseUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/account/login`);
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware này cho các trang giao diện, bỏ qua api, next static files, images
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

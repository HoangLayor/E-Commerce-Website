import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const port = url.port || (url.protocol === 'https:' ? '443' : '80');
  
  const isAdminPath = url.pathname.startsWith('/admin');
  
  // Nếu cố gắng truy cập /admin từ port khác 3001 (ví dụ 3000)
  if (isAdminPath && port !== '3001') {
    // Chuyển hướng sang port 3001
    url.port = '3001';
    return NextResponse.redirect(url);
  }

  // Ngược lại, nếu ở port 3001 nhưng truy cập trang user (không phải /admin và không phải /account/login)
  // Có thể tuỳ chọn chặn, nhưng ở đây chỉ tập trung bảo vệ /admin không cho phép truy cập từ port 3000
  // Nếu muốn bảo mật nghiêm ngặt hơn, uncomment đoạn dưới:
  /*
  if (!isAdminPath && port === '3001' && !url.pathname.startsWith('/account')) {
    url.port = '3000';
    return NextResponse.redirect(url);
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Bỏ qua các file tĩnh và API
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

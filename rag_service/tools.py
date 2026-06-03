import os
import requests
import concurrent.futures
from typing import List
from vector_store import search_products
from context_var import request_token

# Spring Boot API Config
BASE_API_URL = os.getenv("BASE_API_URL", "http://localhost:8081/api/public")

def fetch_single_product(pid: str) -> str:
    try:
        response = requests.get(f"{BASE_API_URL}/product/{pid}", timeout=3)
        if response.status_code == 200:
            p = response.json()
            # Cập nhật theo cấu trúc mới của ProductResponse DTO (chứa priceMin và variants)
            price = p.get('priceMin') or p.get('price') or 0
            
            # Tính tổng tồn kho từ các variants
            stock = 0
            if p.get('variants') and isinstance(p.get('variants'), list):
                stock = sum(v.get('stock', 0) for v in p['variants'] if isinstance(v, dict))
            elif 'stockQuantity' in p:
                stock = p.get('stockQuantity') or 0
            
            cat_name = p.get('categoryName') or (p.get('category', {}).get('name') if isinstance(p.get('category'), dict) else 'Chưa phân loại')
            brand_name = p.get('brandName') or 'Không có'
            
            details = (
                f"- ID: {p.get('id')}\n"
                f"  Tên: {p.get('name')}\n"
                f"  Mô tả: {p.get('description')}\n"
                f"  Giá (từ): {price:,.0f} VND\n"
                f"  Thương hiệu: {brand_name}\n"
                f"  Tồn kho: {stock}\n"
                f"  Danh mục: {cat_name}"
            )
            return details
        else:
            print(f"Error fetching product {pid}: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching product {pid}: {e}")
        return None

def fetch_product_details(product_ids: List[str]) -> str:
    """
    Calls Spring Boot API concurrently to get full details for each product ID.
    """
    context_parts = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(fetch_single_product, product_ids))
        
    for res in results:
        if res:
            context_parts.append(res)
            print(res)
            
    return "\n\n".join(context_parts) if context_parts else "Không tìm thấy thông tin chi tiết sản phẩm."

def search_products_by_keyword(query: str, limit: int = 5) -> str:
    """
    Tìm kiếm sản phẩm trong cơ sở dữ liệu dựa trên mô tả, nhu cầu khách hàng hoặc từ khóa.
    
    Args:
        query: Nhu cầu hoặc từ khóa tìm kiếm (Ví dụ: "kem chống nắng", "son dưỡng")
        limit: Số lượng sản phẩm trả về (mặc định 5)
    """
    print(f"🔧 [TOOL CALL] search_products_by_keyword | query: '{query}', limit: {limit}")
    try:
        search_results = search_products(query, n_results=limit)
        product_ids = search_results["ids"][0] if search_results and "ids" in search_results else []
        if not product_ids:
            return "Không tìm thấy sản phẩm nào phù hợp với từ khóa này."
        return fetch_product_details(product_ids)
    except Exception as e:
        return f"Lỗi hệ thống khi tìm kiếm: {str(e)}"

def get_best_selling_products(limit: int = 5) -> str:
    """
    Lấy danh sách các sản phẩm bán chạy nhất, hot nhất của cửa hàng.

    Args:
        limit: Số lượng sản phẩm trả về (mặc định 5)
    """
    print(f"🔧 [TOOL CALL] get_best_selling_products | limit: {limit}")
    try:
        response = requests.get(f"{BASE_API_URL}/product/best-sellers?limit={limit}", timeout=5)
        if response.status_code == 200:
            products = response.json()
            if not products:
                return "Hiện tại chưa có sản phẩm bán chạy."
            return fetch_product_details([str(p['id']) for p in products])
        return "Lỗi khi lấy dữ liệu sản phẩm bán chạy từ hệ thống."
    except Exception as e:
        return f"Lỗi hệ thống: {str(e)}"

def get_flash_sale_products(limit: int = 5) -> str:
    """
    Lấy danh sách các sản phẩm đang có chương trình giảm giá Flash Sale, khuyến mãi lớn nhất.

    Args:
        limit: Số lượng sản phẩm trả về (mặc định 5)
    """
    print(f"🔧 [TOOL CALL] get_flash_sale_products | limit: {limit}")
    try:
        response = requests.get(f"{BASE_API_URL}/flashsale/active", timeout=5)
        if response.status_code == 200:
            flash_sales = response.json()
            if not flash_sales:
                return "Hiện tại không có chương trình Flash Sale."
            
            context_parts = []
            for fs in flash_sales:
                products = fs.get('products', [])
                if not products:
                    continue
                
                parts = [f"🔥 CHƯƠNG TRÌNH: {fs.get('name')}"]
                for p in products[:limit]:
                    original = p.get('originalPrice') or 0
                    sale = p.get('salePrice') or 0
                    parts.append(
                        f"  - Tên SP: {p.get('productName')}\n"
                        f"    ID Sản phẩm: {p.get('productId')} (Dùng ID này trong thẻ PRODUCTS)\n"
                        f"    Giá gốc: {original:,.0f} VND\n"
                        f"    Giá SALE: {sale:,.0f} VND\n"
                        f"    Đã bán: {p.get('soldQuantity', 0)} / {p.get('quantity', 0)}"
                    )
                context_parts.append("\n".join(parts))
                
            if not context_parts:
                return "Hiện tại không có sản phẩm nào trong chương trình Flash Sale."
                
            return "\n\n".join(context_parts)
        return "Lỗi khi lấy dữ liệu Flash Sale từ hệ thống."
    except Exception as e:
        return f"Lỗi hệ thống: {str(e)}"

# ================= TOOLS MỞ RỘNG MỚI =================

def check_order_status(order_id: int) -> str:
    """
    Tra cứu trạng thái đơn hàng của người dùng. Trả về thông tin trạng thái, ngày đặt và tổng tiền.
    """
    print(f"🔧 [TOOL CALL] check_order_status | order_id: {order_id}")
    token = request_token.get()
    if not token:
        return "Để kiểm tra trạng thái đơn hàng, bạn vui lòng Đăng nhập vào website trước nhé!"
    
    headers = {"Authorization": f"Bearer {token}"}
    try:
        # BASE_API_URL is .../api/public. So we replace /public with /user to get .../api/user/orders
        base_url = BASE_API_URL.replace("/public", "")
        res = requests.get(f"{base_url}/user/orders/{order_id}", headers=headers, timeout=5)
        if res.status_code == 200:
            order = res.json()
            return f"Đơn hàng #{order_id} của bạn có trạng thái: **{order.get('status', 'Không rõ')}**. Ngày đặt: {order.get('createdAt')}, Tổng tiền: {order.get('totalAmount', 0):,.0f} VND."
        elif res.status_code == 404:
            return "Không tìm thấy đơn hàng mã này. Hãy kiểm tra lại mã bạn gửi có đúng không nhé!"
        return f"Không thể tra cứu đơn hàng vào lúc này (Status {res.status_code})."
    except Exception as e:
        return f"Lỗi hệ thống khi tra cứu đơn: {str(e)}"

def check_user_cart() -> str:
    """
    Tra cứu danh sách sản phẩm hiện có trong giỏ hàng của người dùng.
    """
    print(f"🔧 [TOOL CALL] check_user_cart")
    token = request_token.get()
    if not token:
        return "Bạn vui lòng Đăng nhập trên website để xem giỏ hàng của mình nhé!"
    
    headers = {"Authorization": f"Bearer {token}"}
    try:
        base_url = BASE_API_URL.replace("/public", "")
        res = requests.get(f"{base_url}/user/cart", headers=headers, timeout=5)
        if res.status_code == 200:
            items = res.json()
            if not items:
                return "Giỏ hàng của bạn hiện đang trống."
            details = []
            for item in items:
                attributes = ", ".join([v.get('value', '') for v in item.get('attributeValues', [])])
                attr_str = f" ({attributes})" if attributes else ""
                details.append(f"- {item.get('productName')}{attr_str} x {item.get('quantity')} : {item.get('subtotal',0):,.0f} VND")
            return "Giỏ hàng của bạn đang có:\n" + "\n".join(details)
        return "Hệ thống Không thể lấy thông tin giỏ hàng."
    except Exception as e:
        return f"Lỗi truy xuất giỏ hàng: {str(e)}"

def get_product_reviews(product_id: int) -> str:
    """
    Lấy đánh giá, nhận xét (feedback) của khách hàng khác về một sản phẩm thông qua ID.
    Trước khi gọi, nếu người dùng đưa tên sản phẩm, hãy thử dùng tool search_products_by_keyword lấy được ID của sản phẩm trước.
    """
    print(f"🔧 [TOOL CALL] get_product_reviews | product_id: {product_id}")
    try:
        res = requests.get(f"{BASE_API_URL}/review/{product_id}?size=3", timeout=5)
        if res.status_code == 200:
            data = res.json()
            content = data.get('content', [])
            if not content:
                return "Sản phẩm này hiện chưa có đánh giá bình luận nào trên hệ thống."
            reviews = [f"+ Khách {r.get('user', {}).get('name', 'Ẩn danh')} ({r.get('rating')}⭐): {r.get('comment')}" for r in content]
            return f"Dưới đây là một số đánh giá cho sản phẩm ID {product_id}:\n" + "\n".join(reviews)
        return "Không thể tải review sản phẩm hiện tại."
    except Exception as e:
        return f"Lỗi khi tải thông tin đánh giá: {str(e)}"

def get_store_policies() -> str:
    """
    Lấy thông tin chính sách của cửa hàng: bảo hành, đổi trả, phí giao hàng (ship), hàng chính hãng.
    """
    print(f"🔧 [TOOL CALL] get_store_policies")
    return (
        "Dưới đây là chính sách của GlowSkin:\n"
        "- Đổi trả miễn phí trong vòng 7 ngày đối với lỗi nhà sản xuất hoặc gây kích ứng da nặng.\n"
        "- Tất cả sản phẩm cam kết 100% auth (chính hãng).\n"
        "- Miễn phí vận chuyển (FreeShip) cho mọi đơn hàng giá trị trên 300,000 VND.\n"
        "- Thời gian giao hàng: Nội thành (1-2 ngày), Ngoại thành/Tỉnh (3-5 ngày)."
    )

def recommend_skincare_routine(skin_type: str) -> str:
    """
    Tư vấn quy trình (routine) chăm sóc da cơ bản dựa trên tình trạng da khách hàng (VD: Da dầu, da mụn, da khô, da nhạy cảm...).
    """
    print(f"🔧 [TOOL CALL] recommend_skincare_routine | skin_type: '{skin_type}'")
    skin = skin_type.lower()
    if "dầu" in skin or "mụn" in skin:
        return (
            "Routine chuẩn cho da dầu/mụn:\n"
            "   1. Tẩy trang: Ưu tiên dùng Bioderma (nắp xanh lá) hoặc tẩy trang BHA làm sạch sâu.\n"
            "   2. Sữa rửa mặt: Dạng gel tạo bọt nhẹ (La Roche Posay/SVR).\n"
            "   3. Toner: Cân bằng ẩm, chứa AHA/BHA.\n"
            "   4. Tinh chất/Serum: Chọn có thành phần Niacinamide kiểm soát bã nhờn, hoặc B5 phục hồi.\n"
            "   5. Kem dưỡng: Dưỡng ẩm thiên gốc nước dạng Gel mỏng, mát, kháng viêm."
        )
    elif "khô" in skin:
        return (
            "Routine chuẩn cho da khô bong tróc/thiếu ẩm:\n"
            "   1. Tẩy trang: Tẩy trang dạng sáp (balm) hoặc dầu để giữ lớp lipid bảo vệ da.\n"
            "   2. Sữa rửa mặt: Dạng sữa dịu (không bọt), pH 5.5.\n"
            "   3. Toner: Chứa nhìu HA cấp ẩm ngay lập tức.\n"
            "   4. Serum: Hyaluronic acid + B5.\n"
            "   5. Kem dưỡng: Dạng Cream đặc chứa khóa ẩm (Ceramide)."
        )
    elif "nhạy cảm" in skin or "kích ứng" in skin:
        return (
            "Routine cực an toàn cho da nhạy cảm:\n"
            "   1. Tẩy trang: Nước tẩy trang vô cùng lành tính (Ví dụ Bioderma nắp hồng Senbium).\n"
            "   2. Rửa mặt: Rất nhẹ dịu, không hương liệu (Cetaphil / Cerave).\n"
            "   3. Xịt khoáng/Toner: Làm dịu mát da tức thì.\n"
            "   4. Serum: Có tinh chất chiết xuất rau má (Centella).\n"
            "   5. Kem dưỡng: Cơ bản phục hồi mỏng rào bảo vệ da."
        )
    else:
        return (
            "Quy trình chăm sóc da cơ bản:\n"
            "   Sáng: Sữa rửa mặt -> Toner ẩm -> Kem dưỡng -> Kem chống nắng.\n"
            "   Tối: Tẩy trang -> Sữa rửa mặt -> Toner ẩm -> Serum -> Kem dưỡng khóa ẩm."
        )

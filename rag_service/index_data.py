import requests
import os
from vector_store import index_products

# This script would be run periodically to sync DB with Vector Store
API_URL = os.getenv("API_URL", "http://localhost:8081/api/public/product")

def sync_products():
    # In a real app, you'd fetch from your Spring Boot API
    # For now, this is a skeleton
    print("Fetching products from database...")
    products = []
    for page in range(20):
        print("Fetching page", page)
        response = requests.get(API_URL + "?page=" + str(page))
        page_products = response.json()["content"]
        if page_products == []:
            break
        
        for p in page_products:
            cat_name = p.get('categoryName') or (p.get('category', {}).get('name') if isinstance(p.get('category'), dict) else None)
            brand_name = p.get('brandName') or None
            
            products.append({
                "id": p.get("id"),
                "name": p.get("name"),
                "description": p.get("description"),
                "category": cat_name,
                "brand": brand_name
            })
    
    # products = [
    #     {"id": 1, "name": "iPhone 15 Pro", "description": "Màn hình OLED 6.1 inch, chip A17 Pro"},
    #     {"id": 2, "name": "Samsung S24 Ultra", "description": "Màn hình 6.8 inch, Dynamic AMOLED 2X"},
    # ]

    print("Indexing products...")
    print("Số lượng sản phẩm: ", len(products))
    index_products(products)
    print("Successfully indexed products!")

if __name__ == "__main__":
    sync_products()

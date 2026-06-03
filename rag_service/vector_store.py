import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize ChromaDB client
client = chromadb.PersistentClient(path="./chroma_db")

# Use BGE-M3 (Excellent for Vietnamese/Multilingual)
bge_ef = SentenceTransformerEmbeddingFunction(model_name="BAAI/bge-m3")

# Get or create collection with BGE embedding function
collection = client.get_or_create_collection(
    name="products",
    embedding_function=bge_ef
)

def index_products(products):
    """
    products: list of dicts with 'id', 'name', 'description', 'category', 'brand'
    """
    ids = [str(p['id']) for p in products]
    documents = []
    metadatas = []
    for p in products:
        brand = p.get('brand') or 'Không có'
        category = p.get('category') or 'Chưa phân loại'
        content = f"Tên sản phẩm: {p['name']}. Thương hiệu: {brand}. Danh mục: {category}. Mô tả: {p['description']}"
        documents.append(content)
        metadatas.append({"id": p['id'], "name": p['name'], "brand": brand, "category": category})
    
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )

def update_single_product(product_id, name, description, category=None, brand=None):
    """
    Updates or inserts a single product in the vector store.
    """
    brand_val = brand or 'Không có'
    category_val = category or 'Chưa phân loại'
    content = f"Tên sản phẩm: {name}. Thương hiệu: {brand_val}. Danh mục: {category_val}. Mô tả: {description}"
    collection.upsert(
        ids=[str(product_id)],
        documents=[content],
        metadatas=[{"id": product_id, "name": name, "brand": brand_val, "category": category_val}]
    )

def delete_single_product(product_id):
    """
    Deletes a single product from the vector store.
    """
    collection.delete(ids=[str(product_id)])

def search_products(query, n_results=3):
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results
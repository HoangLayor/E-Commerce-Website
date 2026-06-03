import type { Category, Product, ProductVariant, User } from "@/lib/data";
import { cache } from "react";

// API base URL được lấy từ biến môi trường, mặc định là localhost
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

type ApiError = Error & { status?: number };

// --- Interfaces & DTOs ---

export interface BackendCategory {
  id: number;
  name: string;
  description?: string | null;
  parentId?: number | null;
  productCount?: number;
  children?: BackendCategory[];
}

export interface Brand {
  id: number;
  name: string;
}

export interface BackendProductCategory {
  id: number;
  name: string;
  description?: string | null;
}

/** A single attribute descriptor (e.g. { id: 1, name: "color" }) */
export interface BackendAttribute {
  id: number;
  name: string; // e.g. "color", "size"
}

/** A specific value for an attribute (e.g. { id: 5, value: "red", attribute: { id:1, name:"color" } }) */
export interface BackendAttributeValue {
  id: number;
  value: string; // e.g. "red", "M"
  attribute: BackendAttribute;
}

/** Joins a variant to its attribute values */
export interface BackendVariantAttributeValue {
  attributeValue: BackendAttributeValue;
}

export interface BackendProductVariant {
  id: number;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  discountPrice?: number | null;
  effectivePrice?: number;
  discountPercent?: number | null;
  attributeValues?: { name: string; value: string }[];
}

/** NEW: Product no longer carries price/stock/imageUrl directly */
export interface BackendProduct {
  id: number;
  name: string;
  description?: string | null;
  categoryId?: number | null;
  brandId?: number | null;
  category?: BackendProductCategory | null;
  variants?: BackendProductVariant[];
  createdAt?: string;
  averageRating?: number;
  totalReviews?: number;
  totalSold?: number;
  // Legacy fields kept for backward-compat during migration
  price?: number | string;
  stockQuantity?: number;
  imageUrl?: string | null;
}

export interface BackendProductPage {
  content: BackendProduct[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface ProductPage {
  content: Product[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

/** NEW: Cart item now references a variant, not a product */
export interface BackendCartItem {
  id: number;
  variantId: number;
  sku?: string;
  price?: number;
  discountPrice?: number | null;
  effectivePrice?: number;
  discountPercent?: number | null;
  variantImageUrl?: string | null;
  productId: number;
  productName: string;
  brandName?: string | null;
  thumbnail?: string | null;
  subtotal?: number;
  quantity: number;
  attributeValues?: { name: string; value: string }[];
}

export interface LoginResponse {
  message: string;
  email: string;
  role: string;
}

export interface UserProfileResponse {
  name: string;
  email: string;
  imageUrl?: string | null;
  gender?: "male" | "female" | null;
}

export interface Voucher {
  id: number;
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  isCollected?: boolean; // For compatibility
  isUsed?: boolean;      // For compatibility
}

export interface VoucherRequest {
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
  isActive: boolean;
}

export interface VoucherApplyRequest {
  code: string;
  orderAmount: number;
}

export interface VoucherApplyResponse {
  code: string;
  type: string;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

export interface ReviewRequest {
  orderItemId: number;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: number;
  productId: number;
  productName: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
  variant: {
    id: number;
    sku: string;
    imageUrl?: string;
    attributeValues?: { name: string; value: string }[];
  };
}

export interface ReviewListResponse {
  totalReviews: number;
  reviews: ReviewResponse[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export interface OrderUptateStatusRequest {
  id: number;
  status: string;
}

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt?: string;
  orderCount?: number;
  totalSpent?: number;
}

export async function adminFetchUserById(id: number): Promise<BackendUser> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function adminFetchUserOrders(userId: number): Promise<OrderResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders/user/${userId}`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

// Request Types
export interface ProductRequest {
  name: string;
  description: string;
  categoryId: number;
  brandId: number;
  variants?: {
    id?: number;
    sku?: string;
    price: number;
    discountPrice?: number;
    attributeValueIds?: number[];
    imageUrl?: string;
    compareAtPrice?: number;
    costPrice?: number;
    stock: number;
  }[];
}

export interface CategoryRequest {
  name: string;
  description: string;
  parentId?: number | null;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface AddressRequest {
  receiverName: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  id: number;
  receiverName: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

const categoryImages = [
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
];

// --- Helpers ---

function createApiError(message: string, status?: number): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

async function ensureOk(res: Response) {
  const data = await parseResponse(res);
  if (!res.ok) {
    const message = typeof data === "string" ? data : data?.message || `Request failed with status ${res.status}`;
    throw createApiError(message, res.status);
  }
  return data;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function summarize(text: string, maxLength = 110) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

// --- Helpers for variants ---

/**
 * Extract a flat attributes map from a variant's attributeValues.
 * e.g. [{ attributeValue: { attribute: { name: "color" }, value: "red" } }]
 *   → { color: "red" }
 */
export function extractVariantAttributes(
  avs?: BackendVariantAttributeValue[]
): Record<string, string> {
  if (!avs || avs.length === 0) return {};
  const attrs: Record<string, string> = {};
  for (const av of avs) {
    const attrName = av.attributeValue?.attribute?.name ?? "";
    const val = av.attributeValue?.value ?? "";
    if (attrName) attrs[attrName] = val;
  }
  return attrs;
}

/**
 * Returns the best display variant: first in-stock one, or the first variant overall.
 */
export function getDisplayVariant(
  variants: BackendProductVariant[]
): BackendProductVariant | undefined {
  return variants.find((v) => v.stock > 0) ?? variants[0];
}

/**
 * Normalize an image URL so it is always absolute or root-relative.
 */
export function normalizeImageUrl(url?: string | null): string {
  const raw = url || "/placeholder.svg";
  return raw.startsWith("http") || raw.startsWith("/") ? raw : `/${raw}`;
}

// --- Mappers ---

export function safeParseDate(dateVal: any): Date | null {
  if (!dateVal) return null;
  if (typeof dateVal === "string") {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d;
  }
  if (Array.isArray(dateVal)) {
    const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = dateVal;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  if (typeof dateVal === "number") {
    return new Date(dateVal);
  }
  return null;
}

export function mapBackendProduct(product: BackendProduct): Product {
  const description = stripHtml(product.description || "");
  const categoryId = String(
    product.category?.id ?? product.categoryId ?? "0"
  );
  const slug = `${slugify(product.name)}-${product.id}`;

  // ── Variant mapping ──────────────────────────────────────────────
  const backendVariants: BackendProductVariant[] =
    product.variants && product.variants.length > 0
      ? product.variants
      : [
        // Legacy fallback: synthesise a default variant from flat fields
        {
          id: product.id * 1000, // synthetic id unlikely to clash
          sku: `SKU-${product.id}-DEF`,
          price: Number(product.price ?? 0),
          stock: product.stockQuantity ?? 0,
          imageUrl: product.imageUrl,
          isActive: true,
          effectivePrice: Number(product.price ?? 0)
        },
      ];

  const displayVariant = getDisplayVariant(backendVariants)!;
  const displayPrice = Number(displayVariant.effectivePrice ?? displayVariant.price ?? 0);
  const displayImageUrl = normalizeImageUrl(displayVariant.imageUrl);
  const totalStock = backendVariants.reduce((s, v) => s + (v.stock ?? 0), 0);

  const mappedVariants: ProductVariant[] = backendVariants.map((bv) => {
    const attrs: Record<string, string> = {};
    if (bv.attributeValues) {
      bv.attributeValues.forEach(av => {
        attrs[av.name] = av.value;
      });
    }

    // Build a human-readable name from the attribute values
    const attrLabel = Object.values(attrs).join(" / ") || bv.sku || "Mặc định";

    return {
      id: String(bv.id),
      sku: bv.sku,
      name: attrLabel,
      price: Number(bv.effectivePrice ?? bv.price ?? 0),
      discountPrice: bv.discountPrice ? Number(bv.discountPrice) : undefined,
      compareAtPrice: bv.compareAtPrice ? Number(bv.compareAtPrice) : (bv.discountPrice ? Number(bv.price) : undefined),
      costPrice: bv.costPrice ? Number(bv.costPrice) : undefined,
      stock: bv.stock ?? 0,
      inventory: bv.stock ?? 0,
      imageUrl: normalizeImageUrl(bv.imageUrl),
      attributes: attrs,
    };
  });

  // Collect all unique images (from variants + fallback)
  const seenUrls = new Set<string>();
  const images: Product["images"] = [];
  for (const v of backendVariants) {
    const url = normalizeImageUrl(v.imageUrl);
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      images.push({ id: `img-${product.id}-${v.id}`, url, alt: product.name });
    }
  }
  if (images.length === 0) {
    images.push({ id: `img-${product.id}`, url: "/placeholder.svg", alt: product.name });
  }

  const compareAtPrice = displayVariant.compareAtPrice ? Number(displayVariant.compareAtPrice) : null;

  // Refined badge logic
  const badges: string[] = [];

  // 1. Sale badge (if there is a real discount)
  if (compareAtPrice && compareAtPrice > displayPrice) {
    badges.push("sale");
  }

  // 2. Bestseller badge (strictly based on totalSold)
  const isBestseller = product.totalSold ? product.totalSold >= 5 : false;
  if (isBestseller) {
    badges.push("bestseller");
  }

  // 3. New badge (strictly based on createdAt)
  const createdAtDate = product.createdAt ? safeParseDate(product.createdAt) : null;
  const isNew = createdAtDate
    ? (new Date().getTime() - createdAtDate.getTime()) < 10 * 24 * 60 * 60 * 1000
    : false;
  if (isNew) {
    badges.push("new");
  }

  // Fallback: If no badges and totalStock is low, highlight as last items
  if (badges.length === 0 && totalStock > 0 && totalStock <= 5) {
    badges.push("sale"); // or a different category if we want
  }

  return {
    id: String(product.id),
    sku: `SKU-${product.id}`,
    name: product.name,
    slug,
    shortDescription: summarize(description || product.name),
    description: product.description || `<p>${product.name}</p>`,
    price: displayPrice,
    compareAtPrice,
    currency: "VND",
    categoryId,
    brandId: String(product.brandId ?? "brand_glowskin"),
    images,
    variants: mappedVariants,
    attributes: { skin_type: ["all"], concerns: [] },
    rating: {
      average: product.averageRating ?? 0,
      count: product.totalReviews ?? 0
    },
    totalSold: product.totalSold ?? 0,
    badges: badges,
    inventory: { available: totalStock > 0, quantity: totalStock },
    ingredients: [],
    reviews: [],
  };
}

export function mapBackendCategory(
  category: BackendCategory,
  productCount: number,
  index: number,
  level: number = 0
): Category {
  return {
    id: String(category.id),
    name: category.name,
    slug: slugify(category.name),
    description: category.description || `Khám phá các sản phẩm ${category.name.toLowerCase()}`,
    image: categoryImages[index % categoryImages.length],
    productCount,
    parentId: category.parentId ? String(category.parentId) : undefined,
    level,
  };
}

// --- API Functions ---

// Authentication & Profile
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/api/author/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const result = await ensureOk(res);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth-change"));
  }
  return result;
}

export async function registerUser(name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/author/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role: "USER" }),
  });
  const result = await ensureOk(res);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth-change"));
  }
  return result;
}

export async function logoutUser() {
  const res = await fetch(`${API_BASE_URL}/api/author/logout`, {
    method: "POST",
    credentials: "include",
  });
  const result = await ensureOk(res);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth-change"));
  }
  return result;
}

export async function fetchUserProfile(): Promise<UserProfileResponse> {
  const res = await fetch(`${API_BASE_URL}/api/user/me`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function updateUserProfile(userData: Partial<UserProfileResponse>): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/user/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });
  return ensureOk(res);
}

export async function changePassword(data: ChangePasswordRequest) {
  const res = await fetch(`${API_BASE_URL}/api/user/changepassword`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return ensureOk(res);
}

// Products
export async function fetchProducts(options: {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: number[];
  brandIds?: number[];
  attributeValueIds?: number[];
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
} = {}): Promise<Product[]> {
  const page = await fetchProductsPage(options);
  return page.content;
}

export async function fetchProductsPage(options: {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: number[];
  brandIds?: number[];
  attributeValueIds?: number[];
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
} = {}): Promise<ProductPage> {
  const params = new URLSearchParams();
  if (options.keyword) params.append("keyword", options.keyword);
  if (options.minPrice !== undefined) params.append("minPrice", String(options.minPrice));
  if (options.maxPrice !== undefined) params.append("maxPrice", String(options.maxPrice));

  if (options.categoryIds && options.categoryIds.length > 0) {
    options.categoryIds.forEach(id => params.append("categoryIds", String(id)));
  }
  if (options.brandIds && options.brandIds.length > 0) {
    options.brandIds.forEach(id => params.append("brandIds", String(id)));
  }
  if (options.attributeValueIds && options.attributeValueIds.length > 0) {
    options.attributeValueIds.forEach(id => params.append("attributeValueIds", String(id)));
  }

  params.append("page", String(options.page || 0));
  params.append("size", String(options.size || 20));
  params.append("sortBy", options.sortBy || "id");
  params.append("sortDir", options.sortDir || "desc");

  const res = await fetch(`${API_BASE_URL}/api/public/product?${params.toString()}`, { cache: "no-store" });
  const data = (await ensureOk(res)) as BackendProductPage;

  return {
    content: (data.content || []).map(mapBackendProduct),
    totalPages: data.totalPages,
    totalElements: data.totalElements,
    size: data.size,
    number: data.number,
  };
}

export async function fetchProductById(id: number): Promise<Product> {
  if (!id || isNaN(id) || id <= 0) {
    throw createApiError(`Invalid product ID: ${id}`, 400);
  }
  const res = await fetch(`${API_BASE_URL}/api/public/product/${id}`, { cache: "no-store" });
  const data = (await ensureOk(res)) as BackendProduct;
  return mapBackendProduct(data);
}

export async function fetchProductsByCategoryId(categoryId: number): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/api/public/product/category/${categoryId}`, { cache: "no-store" });
  const data = (await ensureOk(res)) as BackendProduct[];
  return data.map(mapBackendProduct);
}

export async function fetchFlashSale(limit = 10): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/api/public/product/flash-sale?limit=${limit}`, { cache: "no-store" });
  const data = (await ensureOk(res)) as BackendProduct[];
  const products = data.map(mapBackendProduct);
  return products.map(p => {
    if (!p.badges.includes("sale")) {
      return { ...p, badges: [...p.badges, "sale"] };
    }
    return p;
  });
}

export async function fetchBestSellers(limit = 10): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/api/public/product/best-sellers?limit=${limit}`, { cache: "no-store" });
  const data = (await ensureOk(res)) as BackendProduct[];
  const products = data.map(mapBackendProduct);
  return products.map(p => {
    if (!p.badges.includes("bestseller")) {
      return { ...p, badges: [...p.badges, "bestseller"] };
    }
    return p;
  });
}

export async function fetchNewProducts(limit = 10): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/api/public/product/new?limit=${limit}`, { cache: "no-store" });
  const data = (await ensureOk(res)) as BackendProduct[];
  const products = data.map(mapBackendProduct);
  return products.map(p => {
    if (!p.badges.includes("new")) {
      return { ...p, badges: [...p.badges, "new"] };
    }
    return p;
  });
}

// Admin Products
export async function adminCreateProduct(product: ProductRequest, imageFiles?: File | File[]) {
  const formData = new FormData();
  formData.append("product", new Blob([JSON.stringify(product)], { type: "application/json" }));

  if (imageFiles) {
    const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    files.forEach(file => {
      formData.append("images", file);
    });
  }

  const res = await fetch(`${API_BASE_URL}/api/admin/product`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return ensureOk(res);
}

export async function adminUpdateProduct(id: number, product: ProductRequest, imageFiles?: File | File[]) {
  const formData = new FormData();
  formData.append("product", new Blob([JSON.stringify(product)], { type: "application/json" }));

  if (imageFiles) {
    const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    files.forEach(file => {
      formData.append("images", file);
    });
  }

  const res = await fetch(`${API_BASE_URL}/api/admin/product/${id}`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  return ensureOk(res);
}

export async function adminDeleteProduct(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/admin/product/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return ensureOk(res);
}

// Admin Users
export async function adminFetchUsers(): Promise<BackendUser[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function adminToggleUserStatus(id: number, active: boolean) {
  const params = new URLSearchParams({ active: String(active) });
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/status?${params.toString()}`, {
    method: "PATCH",
    credentials: "include",
  });
  return ensureOk(res);
}

// Categories
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/api/public/categories`, { cache: "no-store" });
  const data = (await ensureOk(res)) as BackendCategory[];

  const flatCategories: Category[] = [];

  // Recursive function to flatten categories top-down
  const flattenCategories = (backendCat: BackendCategory, index: number, level: number = 0) => {
    const totalCount = backendCat.productCount || 0;
    const mapped = mapBackendCategory(backendCat, totalCount, index, level);
    flatCategories.push(mapped);

    if (backendCat.children && backendCat.children.length > 0) {
      backendCat.children.forEach((child, childIndex) => {
        flattenCategories(child, childIndex, level + 1);
      });
    }
  };

  data.forEach((cat, index) => {
    flattenCategories(cat, index, 0);
  });

  return flatCategories;
}

// Admin Categories
export async function adminCreateCategory(category: CategoryRequest) {
  const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(category),
  });
  return ensureOk(res);
}

export async function adminUpdateCategory(id: number, category: CategoryRequest) {
  const res = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(category),
  });
  return ensureOk(res);
}

export async function adminDeleteCategory(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return ensureOk(res);
}

// Cart
/**
 * Add (or update) a cart line for a specific variant.
 * The new backend expects `variantId` instead of `productId`.
 */
export async function addToCart(variantId: number, quantity: number) {
  const params = new URLSearchParams({
    variantId: String(variantId),
    quantity: String(quantity),
  });
  const res = await fetch(`${API_BASE_URL}/api/user/cart?${params.toString()}`, {
    method: "POST",
    credentials: "include",
  });
  return ensureOk(res);
}

export async function updateCartItemQuantity(variantId: number, quantity: number) {
  const params = new URLSearchParams({
    quantity: String(quantity),
  });
  const res = await fetch(`${API_BASE_URL}/api/user/cart/${variantId}?${params.toString()}`, {
    method: "PUT",
    credentials: "include",
  });
  return ensureOk(res);
}

export async function fetchCartItems(): Promise<BackendCartItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/user/cart`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res) as Promise<BackendCartItem[]>;
}

/**
 * Remove a cart line identified by variantId.
 * The new backend uses `/api/user/cart/{variantId}`.
 */
export async function removeCartItem(variantId: number) {
  const res = await fetch(`${API_BASE_URL}/api/user/cart/${variantId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return ensureOk(res);
}

// Product with Category Hierarchy
export async function fetchProductsByCategoryRecursive(categoryId: number): Promise<Product[]> {
  const products = await fetchProducts(); // Fetch all (simplified for now)
  const categoriesRes = await fetch(`${API_BASE_URL}/api/public/categories`, { cache: "no-store" });
  const categories = (await ensureOk(categoriesRes)) as BackendCategory[];

  function findCategory(cats: BackendCategory[], id: number): BackendCategory | null {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategory(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function getDescendantIds(cat: BackendCategory): number[] {
    let ids = [cat.id];
    if (cat.children) {
      cat.children.forEach(child => {
        ids = [...ids, ...getDescendantIds(child)];
      });
    }
    return ids;
  }

  const targetCategory = findCategory(categories, categoryId);
  if (!targetCategory) return [];

  const allIds = getDescendantIds(targetCategory).map(String);
  return products.filter(p => allIds.includes(p.categoryId));
}

export async function testCategoryFetching() {
  const products = await fetchProducts();
  const categories = await fetchCategories();

  console.log("=== Test Category Fetching ===");
  console.log(`Total Products: ${products.length}`);
  console.log(`Total Flattened Categories: ${categories.length}`);
  categories.forEach(cat => {
    console.log(`- ${cat.name} (ID: ${cat.id}): ${cat.productCount} products`);
  });

  return { products, categories };
}

// Mixed Data
export const fetchBrands = cache(async (): Promise<Brand[]> => {
  const response = await fetch(`${API_BASE_URL}/api/public/brands`);
  if (!response.ok) {
    throw new Error("Không thể tải danh sách thương hiệu");
  }
  return response.json();
});

export const fetchStorefrontData = cache(async () => {
  const products = await fetchProducts();
  const categories = await fetchCategories();
  return { products, categories };
});

// Vouchers
export async function fetchPublicVouchers(): Promise<Voucher[]> {
  const res = await fetch(`${API_BASE_URL}/api/public/vouchers`, { cache: "no-store" });
  return ensureOk(res);
}

export async function applyVoucher(data: VoucherApplyRequest): Promise<VoucherApplyResponse> {
  const res = await fetch(`${API_BASE_URL}/api/vouchers/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return ensureOk(res);
}

export async function adminFetchVouchers(): Promise<Voucher[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/vouchers`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function adminCreateVoucher(data: VoucherRequest): Promise<Voucher> {
  const res = await fetch(`${API_BASE_URL}/api/admin/vouchers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return ensureOk(res);
}

export async function adminUpdateVoucher(id: number, data: VoucherRequest): Promise<Voucher> {
  const res = await fetch(`${API_BASE_URL}/api/admin/vouchers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return ensureOk(res);
}

export async function adminDeleteVoucher(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/vouchers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await ensureOk(res);
}


// Settings
export interface Setting {
  key: string;
  value: string;
  description?: string;
}

export async function fetchSettings(): Promise<Setting[]> {
  const res = await fetch(`${API_BASE_URL}/api/public/settings`, { cache: "no-store" });
  return ensureOk(res);
}

export async function adminUpdateSetting(setting: Setting): Promise<Setting> {
  const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(setting),
  });
  return ensureOk(res);
}

// Reports
export interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChart: { date: string; revenue: number; orders: number }[];
  categoryChart: { name: string; value: number; color: string }[];
  topProducts: { name: string; sales: number; revenue: number; growth: number }[];
  statusChart: { status: string; count: number; color: string }[];
  brandChart: { name: string; value: number; color: string }[];
}

export async function fetchAdminReportSummary(): Promise<ReportSummary> {
  const res = await fetch(`${API_BASE_URL}/api/admin/reports/summary`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

// Admin Orders
export interface OrderItemAttributeValue {
  name: string;
  value: string;
}

export interface OrderItemDTO {
  id: number;
  quantity: number;
  price: number;
  variantId: number;
  productId: number;
  sku: string;
  productName: string;
  variantName: string;
  imageUrl: string;
  attributeValues?: OrderItemAttributeValue[];
  isRestocked?: boolean;
}

export interface OrderResponse {
  id: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  totalPrice: number;
  orderDate: string;
  shippingAddress: string;
  receiverName: string;
  phone: string;
  items?: OrderItemDTO[];
  paymentUrl?: string;
  voucherCode?: string;
  discountAmount?: number;
  cancelReason?: string;
  isRefundRequested?: boolean;
  refundReason?: string;
  refundAccountInfo?: string;
  refundAttachmentUrl?: string;
}

export async function adminFetchAllOrders(): Promise<OrderResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders/all`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function adminFetchOrderById(id: number | string): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders/${id}`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export interface OrderRiskProfileResponse {
  accountAgeDays: number;
  totalSuccessfulOrders: number;
  totalCancelledOrders: number;
  totalFailedDeliveries: number;
  ordersInLast24h: number;
  totalAmount: number;
  paymentMethod: string;
  orderTime: string;
  voucherCode: string | null;
  receiverName: string;
  phone: string;
  shippingAddress: string;
  items: any[];
}

export async function adminFetchOrderRiskProfile(id: number | string): Promise<OrderRiskProfileResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders/${id}/risk-profile`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function adminUpdateOrderStatus(request: { id: number; status: string }): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(request),
  });
  return ensureOk(res);
}

export async function adminRestockOrderItem(orderId: number, itemId: number): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/items/${itemId}/restock`, {
    method: "POST",
    credentials: "include",
  });
  return ensureOk(res);
}

export async function adminConfirmRefund(id: number, refundAttachmentUrl?: string): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders/${id}/refund-confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ refundAttachmentUrl: refundAttachmentUrl || "" }),
  });
  return ensureOk(res);
}


// User Addresses
export async function fetchAddresses(): Promise<AddressResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/user/addresses`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function addAddress(data: AddressRequest): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/user/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  await ensureOk(res);
}

export async function updateAddress(id: number, data: AddressRequest): Promise<AddressResponse> {
  const res = await fetch(`${API_BASE_URL}/api/user/addresses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return ensureOk(res);
}

export async function deleteAddress(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/user/addresses/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await ensureOk(res);
}

export async function setDefaultAddress(id: number): Promise<AddressResponse> {
  const res = await fetch(`${API_BASE_URL}/api/user/addresses/${id}/default`, {
    method: "PUT",
    credentials: "include",
  });
  return ensureOk(res);
}

// User Orders
export async function fetchMyOrders(): Promise<OrderResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/user/orders`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function fetchMyOrderDetail(id: number): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE_URL}/api/user/orders/${id}`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function cancelMyOrder(id: number, reason: string): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE_URL}/api/user/orders/${id}/cancel?reason=${encodeURIComponent(reason)}`, {
    method: "PUT",
    credentials: "include",
  });
  return ensureOk(res);
}

export async function requestRefund(id: number, reason: string, accountInfo: string): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE_URL}/api/user/orders/${id}/refund`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reason, accountInfo }),
  });
  return ensureOk(res);
}

// Payments & Checkout
export async function createVNPayPayment(orderId: number): Promise<{ data: string }> {
  const res = await fetch(`${API_BASE_URL}/api/payment/create-vnpay-payment/${orderId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return (await ensureOk(res)) as { data: string };
}

export async function checkout(data: {
  cartItemIds?: number[];
  addressId?: number;
  paymentMethod: string;
  voucherCode?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/user/orders/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return ensureOk(res);
}

// Chatbot
export interface ChatMessageResponse {
  id: number;
  message: string;
  response: string;
  createdAt: string;
  productIds?: string;
}

export async function sendChatMessage(message: string, history?: { role: string, content: string }[]): Promise<{ response: string, product_ids?: number[] }> {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message, history }),
  });
  return ensureOk(res);
}

export async function fetchChatHistory(): Promise<ChatMessageResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/chat/history`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

// AI Automation
export interface JobLog {
  id: number;
  jobName: string;
  startTime: string;
  endTime: string | null;
  triggerType: string;
  status: string;
  details: string;
  ordersProcessed: number;
  ordersCancelled: number;
  ordersConfirmed: number;
}

export async function fetchAutomationLogs(): Promise<JobLog[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/automation/logs`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function triggerAutomationJob(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/admin/automation/trigger`, {
    method: "POST",
    credentials: "include",
  });
  return ensureOk(res);
}

export async function adminFetchAiSuggestedOrders(): Promise<OrderResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/automation/suggested-cancels`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function adminBulkCancelOrders(orderIds: number[]): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/admin/automation/bulk-cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ orderIds }),
  });
  return ensureOk(res);
}

// Attributes
export interface AttributeValue {
  id: number;
  value: string;
}

export interface Attribute {
  id: number;
  name: string;
  values: AttributeValue[];
}

export const fetchAttributes = async (): Promise<Attribute[]> => {
  const response = await fetch(`${API_BASE_URL}/api/public/attributes`);
  if (!response.ok) throw new Error("Failed to fetch attributes");
  return response.json();
};

// Reviews
export async function createReview(data: ReviewRequest): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/user/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return ensureOk(res);
}

export async function fetchReviewsByProduct(productId: number, page = 0, size = 5): Promise<ReviewListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const res = await fetch(`${API_BASE_URL}/api/public/review/${productId}?${params.toString()}`, {
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function fetchMyReviews(): Promise<ReviewResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/user/reviews/my`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function deleteReview(reviewId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/user/review/${reviewId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return ensureOk(res);
}

// Webhook
export async function triggerWebhook(orders: any[]): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/trigger-webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orders),
  });
  return ensureOk(res);
}

// --- Flash Sale ---

export interface FlashSaleProductResponse {
  id: number;
  variantId: number;
  productName: string;
  originalPrice: number;
  salePrice: number;
  quantity: number;
  soldQuantity: number;
  maxPerUser: number;
  image: string;
}

export interface FlashSaleResponse {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  products: FlashSaleProductResponse[];
}

export async function fetchActiveFlashSales(): Promise<FlashSaleResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/public/flashsale/active`, { cache: "no-store" });
  return ensureOk(res);
}

let activeFlashSalesPromise: Promise<FlashSaleResponse[]> | null = null;
let activeFlashSalesCacheTime = 0;

export async function fetchActiveFlashSalesCached(): Promise<FlashSaleResponse[]> {
  if (typeof window === "undefined") {
    return fetchActiveFlashSales();
  }
  const now = Date.now();
  if (!activeFlashSalesPromise || (now - activeFlashSalesCacheTime > 10000)) {
    activeFlashSalesCacheTime = now;
    activeFlashSalesPromise = fetchActiveFlashSales().catch(err => {
      activeFlashSalesPromise = null;
      throw err;
    });
  }
  return activeFlashSalesPromise;
}

export async function adminFetchAllFlashSales(): Promise<FlashSaleResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/flashsale/all`, { credentials: "include", cache: "no-store" });
  return ensureOk(res);
}

export async function createFlashSale(data: { name: string; startTime: string; endTime: string }): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/admin/flashsale/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return ensureOk(res);
}

export async function addFlashSaleVariant(flashSaleId: number, data: { variantId: number; salePrice: number; quantity: number; maxPerUser: number }): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/admin/flashsale/${flashSaleId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || res.statusText);
  }
  return res.text();
}

export async function toggleFlashSale(flashSaleId: number): Promise<FlashSaleResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/flashsale/toggle/${flashSaleId}`, {
    method: "PUT",
    credentials: "include",
  });
  return ensureOk(res);
}

export async function updateFlashSale(flashSaleId: number, data: { name: string; startTime: string; endTime: string }): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/admin/flashsale/update/${flashSaleId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  return ensureOk(res);
}


// --- Excel Import/Export ---

export async function adminExportProductsExcel(): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/api/admin/product/export`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Không thể xuất file Excel");
  }
  return res.blob();
}

export async function adminImportProductsExcel(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/admin/product/import`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Lỗi khi nhập dữ liệu");
  }
  return res.text();
}

export async function adminExportOrdersExcel(): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders/export`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Không thể xuất file báo cáo đơn hàng");
  }
  return res.blob();
}

export async function adminExportSummaryReportExcel(): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/api/admin/reports/export`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Không thể xuất file báo cáo tổng quan");
  }
  return res.blob();
}

// --- DYNAMIC PAGE BUILDER ---

export interface SectionResponseDTO {
  id: number;
  type: string;
  title?: string;
  position: number;
  configJson: any;
  active?: boolean;
}

export interface PageResponseDTO {
  name: string;
  slug: string;
  sections: SectionResponseDTO[];
}

export async function fetchPageBySlug(slug: string): Promise<PageResponseDTO> {
  const res = await fetch(`${API_BASE_URL}/api/public/pages/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Page not found");
    }
    throw new Error(`Failed to fetch page: ${res.status}`);
  }
  return res.json();
}

// --- ADMIN DYNAMIC PAGE BUILDER ---

export interface CreatePageRequest {
  name: string;
  slug: string;
  active: boolean;
}

export interface PageSummaryDTO {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageSectionRequest {
  pageId: number;
  type: string;
  title: string;
  position: number;
  configJson: any;
  active: boolean;
}

export async function adminFetchPages(): Promise<PageSummaryDTO[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/pages`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function adminCreatePage(data: CreatePageRequest): Promise<PageSummaryDTO> {
  const res = await fetch(`${API_BASE_URL}/api/admin/pages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return ensureOk(res);
}

export async function adminUpdatePage(id: number, data: CreatePageRequest): Promise<PageSummaryDTO> {
  const res = await fetch(`${API_BASE_URL}/api/admin/pages/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return ensureOk(res);
}

export async function adminDeletePage(id: number): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/admin/pages/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to delete page");
  }
  return res.text();
}

export async function adminFetchPageSections(pageId: number): Promise<SectionResponseDTO[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/page/${pageId}`, {
    credentials: "include",
    cache: "no-store",
  });
  return ensureOk(res);
}

export async function adminCreatePageSection(data: CreatePageSectionRequest): Promise<SectionResponseDTO> {
  const res = await fetch(`${API_BASE_URL}/api/admin/section`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return ensureOk(res);
}

export async function adminUpdatePageSection(id: number, data: CreatePageSectionRequest): Promise<SectionResponseDTO> {
  const res = await fetch(`${API_BASE_URL}/api/admin/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return ensureOk(res);
}

export async function adminUploadSectionImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/api/admin/section/upload-image`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  return ensureOk(res);
}

export async function adminDeletePageSection(id: number): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/admin/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to delete page section");
  }
  return res.text();
}

export async function adminReorderPageSections(pageId: number, data: { id: number; position: number }[]): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/admin/page/${pageId}/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to reorder sections");
  }
  return res.text();
}

let bestSellersPromise: Promise<Product[]> | null = null;
let bestSellersCacheTime = 0;

export async function fetchBestSellersCached(): Promise<Product[]> {
  if (typeof window === "undefined") {
    return fetchBestSellers();
  }
  const now = Date.now();
  if (!bestSellersPromise || (now - bestSellersCacheTime > 30000)) {
    bestSellersCacheTime = now;
    bestSellersPromise = fetchBestSellers().catch(err => {
      bestSellersPromise = null;
      throw err;
    });
  }
  return bestSellersPromise;
}

let newProductsPromise: Promise<Product[]> | null = null;
let newProductsCacheTime = 0;

export async function fetchNewProductsCached(): Promise<Product[]> {
  if (typeof window === "undefined") {
    return fetchNewProducts();
  }
  const now = Date.now();
  if (!newProductsPromise || (now - newProductsCacheTime > 30000)) {
    newProductsCacheTime = now;
    newProductsPromise = fetchNewProducts().catch(err => {
      newProductsPromise = null;
      throw err;
    });
  }
  return newProductsPromise;
}



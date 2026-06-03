// Mock data for the cosmetics e-commerce website

export interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  skinType?: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  categoryId: string;
  brandId: string;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: Record<string, string[]>;
  rating: { average: number; count: number };
  totalSold: number;
  badges: string[];
  inventory: { available: boolean; quantity: number };
  ingredients: string[];
  reviews: Review[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  discountPrice?: number;
  compareAtPrice?: number;
  costPrice?: number;
  /** Total stock for this variant (mirrors `inventory` for new model) */
  stock: number;
  inventory: number;
  /** Per-variant image URL; falls back to the product's first image if absent */
  imageUrl?: string;
  attributes: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  parentId?: string;
  level?: number;
  children?: Category[];
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar: string;
  loyaltyPoints: number;
  memberTier: string;
}

// Categories
export const categories: Category[] = [
  {
    id: "cat_skincare",
    name: "Chăm sóc da",
    slug: "cham-soc-da",
    description: "Các sản phẩm chăm sóc da mặt và cơ thể",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    productCount: 45
  },
  {
    id: "cat_makeup",
    name: "Trang điểm",
    slug: "trang-diem",
    description: "Mỹ phẩm trang điểm chuyên nghiệp",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
    productCount: 38
  },
  {
    id: "cat_cleanser",
    name: "Làm sạch",
    slug: "lam-sach",
    description: "Sữa rửa mặt, tẩy trang và các sản phẩm làm sạch",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
    productCount: 25
  },
  {
    id: "cat_suncare",
    name: "Chống nắng",
    slug: "chong-nang",
    description: "Kem chống nắng và bảo vệ da",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop",
    productCount: 18
  },
  {
    id: "cat_bodycare",
    name: "Chăm sóc cơ thể",
    slug: "cham-soc-co-the",
    description: "Dưỡng thể, tắm gội và chăm sóc toàn thân",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop",
    productCount: 32
  },
  {
    id: "cat_haircare",
    name: "Chăm sóc tóc",
    slug: "cham-soc-toc",
    description: "Dầu gội, dầu xả và sản phẩm dưỡng tóc",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
    productCount: 22
  }
];

// Products
export const products: Product[] = [
  {
    id: "prod_001",
    sku: "SERUM-VC-001",
    name: "Serum Vitamin C 20%",
    slug: "serum-vitamin-c-20",
    shortDescription: "Serum Vitamin C giúp làm sáng da, mờ thâm nám",
    description: "<p>Serum Vitamin C 20% với công thức tiên tiến giúp làm sáng da, mờ thâm nám hiệu quả. Sản phẩm chứa thành phần Vitamin C nguyên chất kết hợp Hyaluronic Acid giúp da căng mọng, rạng rỡ.</p>",
    price: 450000,
    compareAtPrice: 550000,
    currency: "VND",
    categoryId: "cat_skincare",
    brandId: "brand_glowskin",
    images: [
      { id: "img_001_1", url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop", alt: "Serum Vitamin C 30ml" },
      { id: "img_001_2", url: "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&h=800&fit=crop", alt: "Kết cấu Serum Vitamin C" }
    ],
    variants: [
      { id: "var_001_1", sku: "SERUM-VC-001-30ML", name: "30ml", price: 450000, stock: 45, inventory: 45, attributes: { size: "30ml" } },
      { id: "var_001_2", sku: "SERUM-VC-001-50ML", name: "50ml", price: 650000, stock: 20, inventory: 20, attributes: { size: "50ml" } }
    ],
    attributes: { skin_type: ["oily", "combination"], concerns: ["dark_spots", "dullness"] },
    rating: { average: 4.5, count: 128 },
    badges: ["bestseller"],
    inventory: { available: true, quantity: 65 },
    ingredients: [
      "Ascorbic Acid (Vitamin C) 20%",
      "Hyaluronic Acid",
      "Niacinamide (Vitamin B3)",
      "Tocopherol (Vitamin E)",
      "Ferulic Acid",
      "Panthenol (Vitamin B5)",
      "Aqua (Water)",
      "Propanediol",
      "Glycerin",
      "Sodium Hyaluronate"
    ],
    reviews: [
      {
        id: "rev_001_1",
        userName: "Nguyễn Thị Lan",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        rating: 5,
        date: "15/01/2026",
        title: "Da sáng lên rõ rệt sau 2 tuần",
        content: "Mình dùng được 2 tuần thì thấy da sáng hơn hẳn, các vết thâm cũng mờ dần. Kết cấu serum mỏng nhẹ, thẩm thấu nhanh. Rất hài lòng!",
        skinType: "Da hỗn hợp",
        verified: true,
        helpful: 24,
        images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop"]
      },
      {
        id: "rev_001_2",
        userName: "Trần Minh Anh",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        rating: 4,
        date: "20/01/2026",
        title: "Tốt nhưng hơi kích ứng ban đầu",
        content: "Sản phẩm chất lượng, nồng độ Vitamin C cao nên 2-3 ngày đầu hơi châm chích nhẹ. Sau đó da quen thì rất ổn, thâm mờ dần.",
        skinType: "Da nhạy cảm",
        verified: true,
        helpful: 18
      },
      {
        id: "rev_001_3",
        userName: "Lê Phương Trang",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        rating: 5,
        date: "28/01/2026",
        title: "Serum Vitamin C tốt nhất mình từng dùng",
        content: "Đã thử nhiều serum Vitamin C nhưng đây là sản phẩm ưng ý nhất. Thẩm thấu nhanh, không bết dính, da sáng mịn rõ rệt. Sẽ repurchase!",
        skinType: "Da dầu",
        verified: true,
        helpful: 31
      }
    ]
  },
  {
    id: "prod_002",
    sku: "CREAM-HYA-002",
    name: "Kem Dưỡng Ẩm Hyaluronic Acid",
    slug: "kem-duong-am-hyaluronic-acid",
    shortDescription: "Kem dưỡng ẩm chuyên sâu với Hyaluronic Acid",
    description: "<p>Kem dưỡng ẩm chuyên sâu chứa 5 loại Hyaluronic Acid giúp cấp ẩm da từ sâu bên trong, duy trì độ ẩm suốt 72 giờ.</p>",
    price: 380000,
    compareAtPrice: null,
    currency: "VND",
    categoryId: "cat_skincare",
    brandId: "brand_glowskin",
    images: [
      { id: "img_002_1", url: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&h=800&fit=crop", alt: "Kem Dưỡng Ẩm 50ml" }
    ],
    variants: [
      { id: "var_002_1", sku: "CREAM-HYA-002-50ML", name: "50ml", price: 380000, stock: 30, inventory: 30, attributes: { size: "50ml" } }
    ],
    attributes: { skin_type: ["dry", "normal"], concerns: ["dehydration"] },
    rating: { average: 4.8, count: 256 },
    totalSold: 450,
    badges: ["new"],
    inventory: { available: true, quantity: 30 },
    ingredients: [
      "Sodium Hyaluronate",
      "Hydrolyzed Hyaluronic Acid",
      "Hyaluronic Acid Crosspolymer",
      "Acetyl Hyaluronic Acid",
      "Hydroxypropyltrimonium Hyaluronate",
      "Ceramide NP",
      "Ceramide AP",
      "Squalane",
      "Shea Butter",
      "Glycerin",
      "Aqua (Water)"
    ],
    reviews: [
      {
        id: "rev_002_1",
        userName: "Phạm Thu Hà",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
        rating: 5,
        date: "10/02/2026",
        title: "Cấp ẩm siêu tốt!",
        content: "Da mình khô lắm nhưng từ khi dùng kem này thì da mềm mại hẳn. Dưỡng ẩm suốt cả ngày, không bị bong tróc nữa.",
        skinType: "Da khô",
        verified: true,
        helpful: 42
      },
      {
        id: "rev_002_2",
        userName: "Hoàng Yến Nhi",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop",
        rating: 5,
        date: "18/02/2026",
        title: "Kết cấu rất dễ chịu",
        content: "Kem mỏng nhẹ, thẩm thấu nhanh mà vẫn dưỡng ẩm sâu. Dùng được cả ngày lẫn đêm. Packaging cũng rất đẹp.",
        skinType: "Da thường",
        verified: true,
        helpful: 15
      }
    ]
  },
  {
    id: "prod_003",
    sku: "CLEANSER-003",
    name: "Sữa Rửa Mặt Dịu Nhẹ",
    slug: "sua-rua-mat-diu-nhe",
    shortDescription: "Sữa rửa mặt pH 5.5 dịu nhẹ cho mọi loại da",
    description: "<p>Sữa rửa mặt dịu nhẹ với độ pH 5.5 phù hợp với mọi loại da, kể cả da nhạy cảm. Công thức không xà phòng giúp làm sạch sâu mà không gây khô da.</p>",
    price: 250000,
    compareAtPrice: 300000,
    currency: "VND",
    categoryId: "cat_cleanser",
    brandId: "brand_purebeauty",
    images: [
      { id: "img_003_1", url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop", alt: "Sữa Rửa Mặt 150ml" }
    ],
    variants: [
      { id: "var_003_1", sku: "CLEANSER-003-150ML", name: "150ml", price: 250000, stock: 100, inventory: 100, attributes: { size: "150ml" } },
      { id: "var_003_2", sku: "CLEANSER-003-300ML", name: "300ml", price: 420000, stock: 50, inventory: 50, attributes: { size: "300ml" } }
    ],
    attributes: { skin_type: ["all"], concerns: ["sensitive"] },
    rating: { average: 4.3, count: 89 },
    badges: [],
    inventory: { available: true, quantity: 150 },
    ingredients: [
      "Aqua (Water)",
      "Glycerin",
      "Cocamidopropyl Betaine",
      "Sodium Cocoyl Glycinate",
      "Panthenol (Vitamin B5)",
      "Allantoin",
      "Centella Asiatica Extract",
      "Aloe Barbadensis Leaf Extract",
      "Chamomilla Recutita Extract",
      "Tocopheryl Acetate"
    ],
    reviews: [
      {
        id: "rev_003_1",
        userName: "Đỗ Khánh Linh",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
        rating: 5,
        date: "05/02/2026",
        title: "Dịu nhẹ thật sự",
        content: "Da nhạy cảm mà dùng rất ổn, không bị kích ứng. Rửa xong da mềm mại chứ không bị khô căng.",
        skinType: "Da nhạy cảm",
        verified: true,
        helpful: 19
      },
      {
        id: "rev_003_2",
        userName: "Vũ Hải Yến",
        avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop",
        rating: 4,
        date: "12/02/2026",
        title: "Tốt cho da nhạy cảm",
        content: "Sữa rửa mặt dịu nhẹ, bọt mịn. Làm sạch được nhưng với da dầu thì có thể chưa đủ sạch lắm.",
        skinType: "Da dầu",
        verified: true,
        helpful: 8
      }
    ]
  },
  {
    id: "prod_004",
    sku: "SUNSCREEN-004",
    name: "Kem Chống Nắng SPF50+",
    slug: "kem-chong-nang-spf50",
    shortDescription: "Kem chống nắng phổ rộng, không gây nhờn rít",
    description: "<p>Kem chống nắng phổ rộng SPF50+ PA++++ bảo vệ da toàn diện khỏi tia UVA/UVB. Kết cấu nhẹ, thẩm thấu nhanh, không để lại vệt trắng.</p>",
    price: 320000,
    compareAtPrice: null,
    currency: "VND",
    categoryId: "cat_suncare",
    brandId: "brand_glowskin",
    images: [
      { id: "img_004_1", url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop", alt: "Kem Chống Nắng 50ml" }
    ],
    variants: [
      { id: "var_004_1", sku: "SUNSCREEN-004-50ML", name: "50ml", price: 320000, stock: 80, inventory: 80, attributes: { size: "50ml" } }
    ],
    attributes: { skin_type: ["all"], concerns: ["sun_protection"] },
    rating: { average: 4.6, count: 312 },
    badges: ["bestseller"],
    inventory: { available: true, quantity: 80 },
    ingredients: [
      "Ethylhexyl Methoxycinnamate",
      "Zinc Oxide",
      "Titanium Dioxide",
      "Niacinamide",
      "Hyaluronic Acid",
      "Centella Asiatica Extract",
      "Tocopheryl Acetate (Vitamin E)",
      "Bisabolol",
      "Aqua (Water)",
      "Cyclopentasiloxane"
    ],
    reviews: [
      {
        id: "rev_004_1",
        userName: "Ngô Thanh Vân",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
        rating: 5,
        date: "01/02/2026",
        title: "Chống nắng tuyệt vời!",
        content: "Kem chống nắng nhẹ nhàng, không nhờn rít, không trắng vệt. Phù hợp dùng hàng ngày dưới lớp trang điểm.",
        skinType: "Da hỗn hợp",
        verified: true,
        helpful: 56,
        images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop"]
      },
      {
        id: "rev_004_2",
        userName: "Bùi Minh Châu",
        avatar: "https://images.unsplash.com/photo-1502767089025-6572583495f9?w=100&h=100&fit=crop",
        rating: 4,
        date: "08/02/2026",
        title: "SPF cao, bảo vệ tốt",
        content: "Dùng đi biển cả ngày không bị cháy nắng. Chỉ cần thoa lại sau 2-3 tiếng. Kết cấu hơi đặc nhưng dàn đều được.",
        skinType: "Da thường",
        verified: true,
        helpful: 33
      },
      {
        id: "rev_004_3",
        userName: "Trịnh Hương Giang",
        avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop",
        rating: 5,
        date: "15/02/2026",
        title: "Dùng hàng ngày rất ổn",
        content: "Mình dùng mỗi ngày trước khi ra ngoài, da không bị bắt nắng. Sản phẩm chính hãng, giao hàng nhanh.",
        skinType: "Da dầu",
        verified: true,
        helpful: 12
      }
    ]
  },
  {
    id: "prod_005",
    sku: "LIPSTICK-005",
    name: "Son Môi Lì Velvet",
    slug: "son-moi-li-velvet",
    shortDescription: "Son lì mịn màng, lên màu chuẩn, bền màu 8 giờ",
    description: "<p>Son lì cao cấp với kết cấu mịn màng như nhung, lên màu chuẩn và bền màu lên đến 8 giờ. Công thức dưỡng ẩm giúp môi mềm mại, không bị khô.</p>",
    price: 280000,
    compareAtPrice: 350000,
    currency: "VND",
    categoryId: "cat_makeup",
    brandId: "brand_luxelips",
    images: [
      { id: "img_005_1", url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=800&fit=crop", alt: "Son Môi Velvet" }
    ],
    variants: [
      { id: "var_005_1", sku: "LIPSTICK-005-RED", name: "Đỏ Cherry", price: 280000, stock: 40, inventory: 40, attributes: { color: "Đỏ Cherry", colorHex: "#8B0000" } },
      { id: "var_005_2", sku: "LIPSTICK-005-PINK", name: "Hồng Nude", price: 280000, stock: 35, inventory: 35, attributes: { color: "Hồng Nude", colorHex: "#E8B4B8" } },
      { id: "var_005_3", sku: "LIPSTICK-005-CORAL", name: "Cam San Hô", price: 280000, stock: 25, inventory: 25, attributes: { color: "Cam San Hô", colorHex: "#FF7F50" } }
    ],
    attributes: { finish: ["matte"], duration: ["8h"] },
    rating: { average: 4.4, count: 178 },
    badges: ["new"],
    inventory: { available: true, quantity: 100 },
    ingredients: [
      "Isododecane",
      "Dimethicone",
      "Trimethylsiloxysilicate",
      "Synthetic Wax",
      "Tocopheryl Acetate (Vitamin E)",
      "Jojoba Seed Oil",
      "Shea Butter",
      "Rosehip Oil",
      "CI 77891",
      "CI 15850"
    ],
    reviews: [
      {
        id: "rev_005_1",
        userName: "Lê Phương Trang",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        rating: 5,
        date: "22/01/2026",
        title: "Son lên màu cực đẹp",
        content: "Màu Đỏ Cherry cực sang, lên môi mịn màng không khô. Bền màu cả ngày ăn uống vẫn còn. Sẽ mua thêm màu khác!",
        skinType: undefined,
        verified: true,
        helpful: 28,
        images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&h=200&fit=crop"]
      },
      {
        id: "rev_005_2",
        userName: "Mai Hồng Nhung",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
        rating: 4,
        date: "25/01/2026",
        title: "Màu Hồng Nude rất xinh",
        content: "Tông Hồng Nude rất phù hợp cho ngày thường. Kết cấu lì mịn, không quá khô. Chỉ trừ 1 sao vì hộp hơi khó mở.",
        skinType: undefined,
        verified: true,
        helpful: 14
      }
    ]
  },
  {
    id: "prod_006",
    sku: "TONER-006",
    name: "Toner Cân Bằng Da",
    slug: "toner-can-bang-da",
    shortDescription: "Toner giúp cân bằng độ pH và se khít lỗ chân lông",
    description: "<p>Toner cân bằng da chứa chiết xuất hoa hồng và Witch Hazel giúp se khít lỗ chân lông, cân bằng độ pH sau bước rửa mặt.</p>",
    price: 290000,
    compareAtPrice: null,
    currency: "VND",
    categoryId: "cat_skincare",
    brandId: "brand_glowskin",
    images: [
      { id: "img_006_1", url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=800&fit=crop", alt: "Toner Cân Bằng Da 200ml" }
    ],
    variants: [
      { id: "var_006_1", sku: "TONER-006-200ML", name: "200ml", price: 290000, stock: 60, inventory: 60, attributes: { size: "200ml" } }
    ],
    attributes: { skin_type: ["oily", "combination"], concerns: ["pores"] },
    rating: { average: 4.2, count: 95 },
    badges: [],
    inventory: { available: true, quantity: 60 },
    ingredients: [
      "Rosa Damascena Flower Water",
      "Hamamelis Virginiana (Witch Hazel) Extract",
      "Glycerin",
      "Niacinamide",
      "Salicylic Acid (BHA) 0.5%",
      "Panthenol",
      "Centella Asiatica Extract",
      "Aloe Barbadensis Leaf Juice",
      "Sodium PCA",
      "Aqua (Water)"
    ],
    reviews: [
      {
        id: "rev_006_1",
        userName: "Đinh Thùy Trang",
        avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop",
        rating: 4,
        date: "08/02/2026",
        title: "Se khít lỗ chân lông tốt",
        content: "Dùng sau rửa mặt thì da mịn hơn, lỗ chân lông nhỏ dần. Mùi hoa hồng dễ chịu. Phù hợp da dầu.",
        skinType: "Da dầu",
        verified: true,
        helpful: 11
      },
      {
        id: "rev_006_2",
        userName: "Cao Kỳ Duyên",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop",
        rating: 4,
        date: "14/02/2026",
        title: "Ổn trong tầm giá",
        content: "Toner dùng được, cân bằng da ổn. Không có gì đặc biệt nổi trội nhưng cũng không có gì để chê.",
        skinType: "Da hỗn hợp",
        verified: true,
        helpful: 6
      }
    ]
  },
  {
    id: "prod_007",
    sku: "MASK-007",
    name: "Mặt Nạ Dưỡng Ẩm Collagen",
    slug: "mat-na-duong-am-collagen",
    shortDescription: "Mặt nạ giấy cấp ẩm và phục hồi da tức thì",
    description: "<p>Mặt nạ giấy siêu mỏng thấm đẫm tinh chất Collagen và Vitamin E giúp cấp ẩm sâu, phục hồi da mệt mỏi chỉ sau 15 phút.</p>",
    price: 35000,
    compareAtPrice: 45000,
    currency: "VND",
    categoryId: "cat_skincare",
    brandId: "brand_purebeauty",
    images: [
      { id: "img_007_1", url: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=800&fit=crop", alt: "Mặt Nạ Collagen" }
    ],
    variants: [
      { id: "var_007_1", sku: "MASK-007-1PC", name: "1 miếng", price: 35000, stock: 200, inventory: 200, attributes: { size: "1 miếng" } },
      { id: "var_007_2", sku: "MASK-007-10PC", name: "Hộp 10 miếng", price: 300000, stock: 50, inventory: 50, attributes: { size: "Hộp 10 miếng" } }
    ],
    attributes: { skin_type: ["all"], concerns: ["dehydration", "dullness"] },
    rating: { average: 4.7, count: 432 },
    badges: ["bestseller"],
    inventory: { available: true, quantity: 250 },
    ingredients: [
      "Hydrolyzed Collagen",
      "Tocopheryl Acetate (Vitamin E)",
      "Sodium Hyaluronate",
      "Ceramide NP",
      "Centella Asiatica Extract",
      "Aloe Barbadensis Leaf Extract",
      "Glycerin",
      "Panthenol",
      "Allantoin",
      "Aqua (Water)"
    ],
    reviews: [
      {
        id: "rev_007_1",
        userName: "Phạm Ngọc Hân",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
        rating: 5,
        date: "25/01/2026",
        title: "Cấp ẩm tức thì!",
        content: "Mặt nạ giấy mỏng, ôm sát mặt. Tinh chất nhiều và thẩm thấu tốt. Dùng xong da căng mọng ngay lập tức!",
        skinType: "Da khô",
        verified: true,
        helpful: 38
      },
      {
        id: "rev_007_2",
        userName: "Huỳnh Thị Bé",
        avatar: "https://images.unsplash.com/photo-1502767089025-6572583495f9?w=100&h=100&fit=crop",
        rating: 5,
        date: "02/02/2026",
        title: "Mua hộp 10 miếng tiết kiệm hơn",
        content: "Chất lượng tốt mà giá hợp lý. Mua hộp 10 dùng dần, mỗi tuần 2-3 lần. Da mình đỡ khô hẳn.",
        skinType: "Da thường",
        verified: true,
        helpful: 22
      },
      {
        id: "rev_007_3",
        userName: "Nguyễn Thị Kim",
        avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop",
        rating: 4,
        date: "10/02/2026",
        title: "Dùng trước makeup rất tốt",
        content: "Đắp mask trước khi trang điểm thì makeup bám rất đẹp. Chỉ hơi tiếc là tinh chất còn thừa nhiều trong gói.",
        skinType: "Da hỗn hợp",
        verified: true,
        helpful: 17
      }
    ]
  },
  {
    id: "prod_008",
    sku: "EYECREAM-008",
    name: "Kem Dưỡng Mắt Chống Lão Hóa",
    slug: "kem-duong-mat-chong-lao-hoa",
    shortDescription: "Kem mắt giảm nếp nhăn và quầng thâm hiệu quả",
    description: "<p>Kem dưỡng vùng mắt chứa Retinol và Peptide giúp giảm nếp nhăn, quầng thâm và bọng mắt hiệu quả. Kết cấu nhẹ, thẩm thấu nhanh.</p>",
    price: 520000,
    compareAtPrice: 650000,
    currency: "VND",
    categoryId: "cat_skincare",
    brandId: "brand_glowskin",
    images: [
      { id: "img_008_1", url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop", alt: "Kem Dưỡng Mắt 15ml" }
    ],
    variants: [
      { id: "var_008_1", sku: "EYECREAM-008-15ML", name: "15ml", price: 520000, stock: 25, inventory: 25, attributes: { size: "15ml" } }
    ],
    attributes: { skin_type: ["all"], concerns: ["wrinkles", "dark_circles"] },
    rating: { average: 4.6, count: 156 },
    badges: ["new"],
    inventory: { available: true, quantity: 25 },
    ingredients: [
      "Retinol 0.05%",
      "Palmitoyl Tripeptide-1",
      "Palmitoyl Tetrapeptide-7",
      "Caffeine",
      "Vitamin K",
      "Squalane",
      "Sodium Hyaluronate",
      "Ceramide NP",
      "Jojoba Seed Oil",
      "Aqua (Water)"
    ],
    reviews: [
      {
        id: "rev_008_1",
        userName: "Trương Quỳnh Anh",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        rating: 5,
        date: "15/02/2026",
        title: "Quầng thâm giảm rõ rệt",
        content: "Mình bị quầng thâm nặng do thức khuya. Dùng được 3 tuần thì vùng mắt sáng hơn hẳn. Kết cấu nhẹ, không gây mụn thịt.",
        skinType: "Da hỗn hợp",
        verified: true,
        helpful: 29
      },
      {
        id: "rev_008_2",
        userName: "Lý Nhã Kỳ",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        rating: 4,
        date: "20/02/2026",
        title: "Giảm nếp nhăn tốt",
        content: "Vùng mắt mịn hơn sau 1 tháng sử dụng. Giá hơi cao nhưng chỉ cần lấy rất ít nên dùng được lâu.",
        skinType: "Da thường",
        verified: true,
        helpful: 21
      }
    ]
  }
];

// Brands
export const brands = [
  { id: "brand_glowskin", name: "GlowSkin", logo: "/brands/glowskin.png" },
  { id: "brand_purebeauty", name: "PureBeauty", logo: "/brands/purebeauty.png" },
  { id: "brand_luxelips", name: "LuxeLips", logo: "/brands/luxelips.png" }
];

// Testimonials
export const testimonials = [
  {
    id: "test_001",
    name: "Nguyễn Thị Lan",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    content: "Sản phẩm rất tuyệt vời! Da tôi sáng lên rõ rệt sau 2 tuần sử dụng Serum Vitamin C. Sẽ mua thêm.",
    product: "Serum Vitamin C 20%",
    date: "15/01/2026"
  },
  {
    id: "test_002",
    name: "Trần Minh Hương",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    content: "Kem dưỡng ẩm này thật sự hiệu quả. Da khô của tôi bây giờ đã căng mọng và mềm mại hơn nhiều.",
    product: "Kem Dưỡng Ẩm Hyaluronic Acid",
    date: "20/01/2026"
  },
  {
    id: "test_003",
    name: "Lê Phương Trang",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    rating: 4,
    content: "Giao hàng nhanh, đóng gói cẩn thận. Son lên màu rất đẹp và bền màu cả ngày.",
    product: "Son Môi Lì Velvet",
    date: "22/01/2026"
  }
];

// Format price in Vietnamese currency
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

// Calculate discount percentage
export function getDiscountPercentage(price: number, compareAtPrice: number | null): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

// Get badge color
export function getBadgeColor(badge: string): string {
  switch (badge) {
    case 'bestseller':
      return 'bg-primary text-primary-foreground';
    case 'new':
      return 'bg-success text-white';
    case 'sale':
      return 'bg-error text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

// Get badge label
export function getBadgeLabel(badge: string): string {
  switch (badge) {
    case 'bestseller':
      return 'Bán chạy';
    case 'new':
      return 'Mới';
    case 'sale':
      return 'Giảm giá';
    default:
      return badge;
  }
}

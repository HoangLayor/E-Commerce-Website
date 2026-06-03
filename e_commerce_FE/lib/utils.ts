import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type Category } from "@/lib/data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildCategoryTree(categories: Category[]): Category[] {
  const categoryMap = new Map<string, Category & { children: Category[] }>();
  const roots: Category[] = [];

  // Initialize map with shallow copies and empty children arrays
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Build tree
  categories.forEach(cat => {
    const node = categoryMap.get(cat.id)!;
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      categoryMap.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

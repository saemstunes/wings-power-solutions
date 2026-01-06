import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string | null;
  category: string;
  part_number: string | null;
  short_description: string | null;
  full_description: string | null;
  specifications: Record<string, unknown>;
  price: number | null;
  currency: string;
  stock_quantity: number;
  min_order_quantity: number;
  primary_image_url: string | null;
  additional_images: string[];
  status: string;
  tags: string[];
  compatible_engines: string[];
  created_at: string;
  updated_at: string;
}

interface UseProductsOptions {
  category?: string;
  brand?: string;
  search?: string;
  inStockOnly?: boolean;
  limit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { category, brand, search, inStockOnly, limit = 50 } = options;

  return useQuery({
    queryKey: ["products", { category, brand, search, inStockOnly, limit }],
    queryFn: async () => {
      let query = supabase
        .from("product_catalog")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (brand && brand !== "all") {
        query = query.eq("brand", brand);
      }

      if (inStockOnly) {
        query = query.gt("stock_quantity", 0);
      }

      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        query = query.or(`name.ilike.${searchTerm},part_number.ilike.${searchTerm},short_description.ilike.${searchTerm},brand.ilike.${searchTerm}`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Product[];
    },
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_catalog")
        .select("category")
        .eq("status", "active");

      if (error) throw error;

      const categories = [...new Set(data?.map((p) => p.category) || [])];
      return categories;
    },
  });
}

export function useProductBrands() {
  return useQuery({
    queryKey: ["product-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_catalog")
        .select("brand")
        .eq("status", "active");

      if (error) throw error;

      const brands = [...new Set(data?.map((p) => p.brand) || [])];
      return brands;
    },
  });
}

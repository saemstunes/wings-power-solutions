import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, X, Loader2, MessageCircle } from "lucide-react";
import { useProducts, Product } from "@/hooks/useProducts";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: products, isLoading } = useProducts({
    search: debouncedSearch,
    limit: 10,
  });

  const handleQuote = (product: Product) => {
    const message = `Hi, I'm interested in ${product.name} (Part #${product.part_number}). Can you provide more details and pricing?`;
    window.open(`https://wa.me/254718234222?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleNotFound = () => {
    const message = `Hi, I'm looking for a spare part: "${searchQuery}". Can you help me find it?`;
    window.open(`https://wa.me/254718234222?text=${encodeURIComponent(message)}`, "_blank");
  };

  const getStockStatus = (quantity: number) => {
    if (quantity > 20) return { label: "In Stock", variant: "default" as const };
    if (quantity > 0) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "Out of Stock", variant: "destructive" as const };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t("products.search") || "Search Spare Parts"}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by part name, number, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-[200px] mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock_quantity);
                return (
                  <div
                    key={product.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {product.primary_image_url ? (
                        <img
                          src={product.primary_image_url}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {product.brand} • {product.part_number}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={stockStatus.variant} className="text-xs">
                          {stockStatus.label}
                        </Badge>
                        {product.price && (
                          <span className="text-sm font-medium text-primary">
                            {product.currency} {product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleQuote(product)} className="flex-shrink-0">
                      Quote
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : debouncedSearch ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-2">No parts found</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                We couldn't find "{debouncedSearch}" in our catalog, but we can source it for you!
              </p>
              <Button onClick={handleNotFound} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Ask Us About This Part
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start typing to search our spare parts catalog</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Loader2, MessageCircle, Wrench } from "lucide-react";
import { useProducts, Product } from "@/hooks/useProducts";

interface EngineFinderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const engineBrands = [
  { id: "lister-petter", name: "Lister Petter" },
  { id: "perkins", name: "Perkins" },
  { id: "cat", name: "CAT" },
  { id: "cummins", name: "Cummins" },
  { id: "other", name: "Other" },
];

const engineModels: Record<string, string[]> = {
  "lister-petter": ["LPW2", "LPW3", "LPW4", "LPWS2", "LPWS3", "LPWS4", "Alpha LPW2", "Alpha LPW3", "Alpha LPW4"],
  "perkins": ["400 Series", "1100 Series", "1200 Series", "1500 Series"],
  "cat": ["C4.4", "C7.1", "C9", "C13", "C15"],
  "cummins": ["4BT", "6BT", "ISB", "ISC", "QSB"],
  "other": ["Universal"],
};

const partCategories = [
  { id: "all", name: "All Parts" },
  { id: "engine-components", name: "Engine Components" },
  { id: "gaskets-seals", name: "Gaskets & Seals" },
  { id: "fuel-system", name: "Fuel System" },
  { id: "electrical", name: "Electrical" },
];

export function EngineFinderModal({ open, onOpenChange }: EngineFinderModalProps) {
  const { t } = useLanguage();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showResults, setShowResults] = useState(false);

  const { data: products, isLoading } = useProducts({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    limit: 20,
  });

  const filteredProducts = products?.filter((product) => {
    if (!selectedModel) return true;
    return product.compatible_engines?.some((engine) =>
      engine.toLowerCase().includes(selectedModel.toLowerCase())
    );
  });

  const handleSearch = () => {
    setShowResults(true);
  };

  const handleQuote = (product: Product) => {
    const message = `Hi, I'm interested in ${product.name} (Part #${product.part_number}) for my ${selectedBrand} ${selectedModel} engine. Can you provide more details and pricing?`;
    window.open(`https://wa.me/254718234222?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleContactUs = () => {
    const message = `Hi, I'm looking for parts for my ${selectedBrand || "engine"} ${selectedModel || ""}. Can you help me find compatible parts?`;
    window.open(`https://wa.me/254718234222?text=${encodeURIComponent(message)}`, "_blank");
  };

  const getStockStatus = (quantity: number) => {
    if (quantity > 20) return { label: "In Stock", variant: "default" as const };
    if (quantity > 0) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "Out of Stock", variant: "destructive" as const };
  };

  const resetSearch = () => {
    setShowResults(false);
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedCategory("all");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetSearch();
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Find Parts for Your Engine
          </DialogTitle>
          <DialogDescription>
            Select your engine to find compatible spare parts
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-6 py-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Engine Brand</label>
                <Select value={selectedBrand} onValueChange={(value) => {
                  setSelectedBrand(value);
                  setSelectedModel("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Brand..." />
                  </SelectTrigger>
                  <SelectContent>
                    {engineBrands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBrand && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Engine Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {engineModels[selectedBrand]?.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Part Type (Optional)</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Parts" />
                  </SelectTrigger>
                  <SelectContent>
                    {partCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Not sure? Check the engine nameplate or contact us
            </p>

            <div className="flex gap-3">
              <Button onClick={handleSearch} disabled={!selectedBrand} className="flex-1">
                Find Compatible Parts
              </Button>
              <Button variant="outline" onClick={handleContactUs}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask Expert
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-[200px]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing parts for {engineBrands.find(b => b.id === selectedBrand)?.name} {selectedModel}
              </p>
              <Button variant="ghost" size="sm" onClick={resetSearch}>
                New Search
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="space-y-3">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity);
                  return (
                    <div
                      key={product.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.primary_image_url ? (
                          <img
                            src={product.primary_image_url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {product.brand} • {product.part_number}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={stockStatus.variant} className="text-xs">
                            {stockStatus.label}
                          </Badge>
                          {product.price && (
                            <span className="text-xs font-medium text-primary">
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
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-foreground mb-2">No exact matches found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  We can source parts for your {selectedModel} engine. Contact us for assistance!
                </p>
                <Button onClick={handleContactUs} className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact Our Experts
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

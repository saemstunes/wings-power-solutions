import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Search, Filter, Wrench } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { SearchModal } from "@/components/landing/SearchModal";
import { EngineFinderModal } from "@/components/landing/EngineFinderModal";

const categoryOptions = [
  { id: "all", name: "All Categories", nameSwahili: "Aina Zote" },
  { id: "engine-components", name: "Engine Components", nameSwahili: "Vifaa vya Injini" },
  { id: "gaskets-seals", name: "Gaskets & Seals", nameSwahili: "Gasket na Seal" },
  { id: "fuel-system", name: "Fuel System", nameSwahili: "Mfumo wa Mafuta" },
  { id: "cooling-system", name: "Cooling System", nameSwahili: "Mfumo wa Baridi" },
  { id: "electrical", name: "Electrical", nameSwahili: "Umeme" },
  { id: "belts-hoses", name: "Belts & Hoses", nameSwahili: "Mikanda na Mirija" },
  { id: "fasteners-hardware", name: "Fasteners", nameSwahili: "Vifungio" },
];

const Products = () => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [engineFinderOpen, setEngineFinderOpen] = useState(false);

  const { data: products, isLoading } = useProducts({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    search: searchQuery,
    limit: 8,
  });

  const getStockStatus = (quantity: number) => {
    if (quantity > 20) return { label: t("products.inStock"), variant: "default" as const };
    if (quantity > 0) return { label: t("products.lowStock"), variant: "secondary" as const };
    return { label: t("products.outOfStock"), variant: "destructive" as const };
  };

  const handleQuote = (product: { name: string; part_number: string | null }) => {
    const message = `Hi, I'm interested in ${product.name} (Part #${product.part_number}). Can you provide more details and pricing?`;
    window.open(`https://wa.me/254718234222?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="products" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("products.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("products.subtitle")}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parts by name, number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onClick={() => setSearchModalOpen(true)}
              readOnly
            />
          </div>
          <Button variant="outline" onClick={() => setSearchModalOpen(true)} className="gap-2">
            <Filter className="h-4 w-4" />
            Advanced Search
          </Button>
          <Button variant="secondary" onClick={() => setEngineFinderOpen(true)} className="gap-2">
            <Wrench className="h-4 w-4" />
            Find by Engine
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categoryOptions.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {language === "en" ? category.name : category.nameSwahili}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="aspect-square bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full mb-4" />
                  <div className="h-8 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock_quantity);
              return (
                <Card
                  key={product.id}
                  className="group hover:shadow-lg transition-all duration-300 border-border"
                >
                  <CardHeader className="pb-2">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors overflow-hidden">
                      {product.primary_image_url ? (
                        <img
                          src={product.primary_image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base line-clamp-2">
                          {product.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {product.brand} • {product.part_number}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {product.short_description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                      {product.price && (
                        <span className="font-semibold text-primary">
                          {product.currency} {Number(product.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => handleQuote(product)}
                    >
                      {t("products.requestQuote")}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search term</p>
            <Button onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}>
              Clear Filters
            </Button>
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setSearchModalOpen(true)}
          >
            {t("products.viewAll")}
          </Button>
        </div>
      </div>

      {/* Modals */}
      <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
      <EngineFinderModal open={engineFinderOpen} onOpenChange={setEngineFinderOpen} />
    </section>
  );
};

export default Products;

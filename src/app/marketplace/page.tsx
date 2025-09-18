"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Search, Filter, ShoppingCart, Plus, Minus, DollarSign, Package, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const MarketplacePage = () => {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  
  // New filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]); // LKR range
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock">("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "newest">("newest");
  
  // Pagination state for All Products view
  const [itemsPerCategory, setItemsPerCategory] = useState<Record<string, number>>({});
  const INITIAL_ITEMS_PER_CATEGORY = 3;

  const items = useQuery(api.marketplace.getMarketplaceItems, {
    category: selectedCategory,
  });

  const cartSummary = useQuery(
    api.cart.getCartSummary,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const addToCart = useMutation(api.cart.addToCart);

  const categories = [
    { value: undefined, label: "All Products" },
    { value: "supplements", label: "Supplements" },
    { value: "equipment", label: "Equipment" },
    { value: "apparel", label: "Apparel" },
    { value: "accessories", label: "Accessories" },
    { value: "nutrition", label: "Nutrition" },
  ];

  const filteredItems = items?.filter(
    (item) => {
      // Category filter
      const matchesCategory = selectedCategory === undefined || item.category === selectedCategory;
      
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Price range filter
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
      
      // Stock filter
      const matchesStock = stockFilter === "all" || 
        (stockFilter === "inStock" && item.stock > 0) ||
        (stockFilter === "outOfStock" && item.stock === 0);
      
      return matchesCategory && matchesSearch && matchesPrice && matchesStock;
    }
  )?.sort((a, b) => {
    // First, prioritize featured items
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1; // Featured items come first
    }
    
    // Then apply the selected sorting within featured/non-featured groups
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price":
        return a.price - b.price;
      case "newest":
      default:
        return new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime();
    }
  });

  // Group items by category when showing all products
  const groupedItems =
    selectedCategory === undefined && filteredItems
      ? (() => {
          const grouped: Record<string, { label: string; items: typeof filteredItems }> = {};
          
          // First, add featured items if any exist
          const featuredItems = filteredItems.filter(item => item.featured);
          if (featuredItems.length > 0) {
            const sortedFeaturedItems = featuredItems.sort((a, b) => {
              switch (sortBy) {
                case "name":
                  return a.name.localeCompare(b.name);
                case "price":
                  return a.price - b.price;
                case "newest":
                default:
                  return new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime();
              }
            });
            grouped["featured"] = {
              label: "Featured",
              items: sortedFeaturedItems,
            };
          }
          
          // Then add regular categories (skip "All Products")
          categories.slice(1).forEach(category => {
            const categoryItems = filteredItems.filter(
              (item) => item.category === category.value
            );
            if (categoryItems.length > 0) {
              // Apply sorting to each category group with featured items priority
              const sortedCategoryItems = categoryItems.sort((a, b) => {
                // First, prioritize featured items
                if (a.featured !== b.featured) {
                  return a.featured ? -1 : 1; // Featured items come first
                }
                
                // Then apply the selected sorting within featured/non-featured groups
                switch (sortBy) {
                  case "name":
                    return a.name.localeCompare(b.name);
                  case "price":
                    return a.price - b.price;
                  case "newest":
                  default:
                    return new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime();
                }
              });
              grouped[category.value!] = {
                label: category.label,
                items: sortedCategoryItems,
              };
            }
          });
          
          return grouped;
        })()
      : null;

  // Helper functions for pagination
  const getVisibleItemsForCategory = (categoryKey: string, items: any[]) => {
    const currentCount = itemsPerCategory[categoryKey] || INITIAL_ITEMS_PER_CATEGORY;
    return items.slice(0, currentCount);
  };

  const loadMoreForCategory = (categoryKey: string) => {
    setItemsPerCategory(prev => ({
      ...prev,
      [categoryKey]: (prev[categoryKey] || INITIAL_ITEMS_PER_CATEGORY) + INITIAL_ITEMS_PER_CATEGORY
    }));
  };

  const hasMoreItemsForCategory = (categoryKey: string, totalItems: number) => {
    const currentCount = itemsPerCategory[categoryKey] || INITIAL_ITEMS_PER_CATEGORY;
    return currentCount < totalItems;
  };

  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    if (!user?.id) return;

    setAddingToCart(productId);
    try {
      await addToCart({
        clerkId: user.id,
        productId: productId as any,
        quantity,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding item to cart. Please try again.");
    } finally {
      setAddingToCart(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(price);
  };

  return (
    <div
      className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background"
      suppressHydrationWarning
    >
      {/* Background Effects */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"
        suppressHydrationWarning
      ></div>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb,220,38,38),0.1)_0%,transparent_50%)]"
        suppressHydrationWarning
      ></div>

      <div
        className="container mx-auto px-4 py-32 relative z-10 flex-1"
        suppressHydrationWarning
      >
        {/* Centered Header */}
        <div className="max-w-4xl mx-auto text-center mb-16" suppressHydrationWarning>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            <span className="text-primary">Fitness</span> Marketplace
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            Shop premium fitness equipment, supplements, and gear to enhance
            your workout experience
          </p>
        </div>

        <div className="max-w-7xl mx-auto flex gap-8">
          {/* Sticky Search + Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Search Bar - Sticky */}
              <div className="bg-card/50 border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Search Products
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
                  />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="bg-card/50 border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Price Range (LKR)
                </h3>
                <div className="space-y-4">
                  {/* Range Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="500"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const newMin = Number(e.target.value);
                        if (newMin <= priceRange[1]) {
                          setPriceRange([newMin, priceRange[1]]);
                        }
                      }}
                      className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider-thumb"
                      style={{ zIndex: 1 }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const newMax = Number(e.target.value);
                        if (newMax >= priceRange[0]) {
                          setPriceRange([priceRange[0], newMax]);
                        }
                      }}
                      className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider-thumb"
                      style={{ zIndex: 2 }}
                    />
                    <div className="h-2 bg-gray-200 rounded-lg dark:bg-gray-700">
                      <div 
                        className="h-full bg-primary rounded-lg"
                        style={{
                          marginLeft: `${(priceRange[0] / 50000) * 100}%`,
                          width: `${((priceRange[1] - priceRange[0]) / 50000) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Min/Max Input Fields */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-muted-foreground mb-1">Min</label>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const newMin = Number(e.target.value) || 0;
                          if (newMin <= priceRange[1] && newMin >= 0) {
                            setPriceRange([newMin, priceRange[1]]);
                          }
                        }}
                        className="w-full px-2 py-1 text-xs border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground"
                      />
                    </div>
                    <span className="text-muted-foreground text-sm mt-4">-</span>
                    <div className="flex-1">
                      <label className="block text-xs text-muted-foreground mb-1">Max</label>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const newMax = Number(e.target.value) || 50000;
                          if (newMax >= priceRange[0] && newMax <= 50000) {
                            setPriceRange([priceRange[0], newMax]);
                          }
                        }}
                        className="w-full px-2 py-1 text-xs border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground"
                      />
                    </div>
                  </div>
                  
                  {/* Display Current Range */}
                  <div className="text-sm text-center text-muted-foreground bg-muted/30 rounded px-3 py-2">
                    LKR {priceRange[0].toLocaleString()} - LKR {priceRange[1].toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Stock & Sort Filters */}
              <div className="bg-card/50 border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Filters & Sort
                </h3>
                
                {/* Stock Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-foreground">Availability</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="stock"
                        value="all"
                        checked={stockFilter === "all"}
                        onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                        className="mr-2 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">All Items</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="stock"
                        value="inStock"
                        checked={stockFilter === "inStock"}
                        onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                        className="mr-2 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">In Stock</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="stock"
                        value="outOfStock"
                        checked={stockFilter === "outOfStock"}
                        onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                        className="mr-2 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Out of Stock</span>
                    </label>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-foreground">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="price">Price (Low to High)</option>
                  </select>
                </div>

                {/* Reset Filters Button */}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setPriceRange([0, 50000]);
                    setStockFilter("all");
                    setSortBy("newest");
                    setSelectedCategory(undefined);
                    setItemsPerCategory({}); // Reset pagination
                  }}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  Reset All Filters
                </button>
              </div>

              {/* Category Navigation - Sticky */}
              <div className="bg-card/50 border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Categories
                </h2>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.value || "all"}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        selectedCategory === category.value
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart Summary - Sticky */}
              {user && cartSummary && cartSummary.totalItems > 0 && (
                <div className="bg-card/50 border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Cart Summary</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span className="font-medium text-foreground">{cartSummary.totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-bold text-foreground text-lg">{formatPrice(cartSummary.totalPrice)}</span>
                    </div>
                  </div>
                  <Link href="/marketplace/cart" className="block mt-4">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      View Cart
                    </Button>
                  </Link>
                </div>
              )}

              {/* Cart Button for Users without items - Sticky */}
              {user && (!cartSummary || cartSummary.totalItems === 0) && (
                <div className="bg-card/50 border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Shopping Cart</h3>
                  <p className="text-muted-foreground text-sm mb-4">Your cart is empty</p>
                  <Link href="/marketplace/cart" className="block">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      View Cart
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1 min-w-0">
            {/* Mobile Search Bar */}
            <div className="mb-8 lg:hidden">
              <div className="bg-card/50 border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Search Products
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Cart Button */}
            {user && (
              <div className="lg:hidden flex justify-end mb-8">
                <Link href="/marketplace/cart">
                  <Button className="relative bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Cart
                    {cartSummary && cartSummary.totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                        {cartSummary.totalItems}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Category Filters */}
            <div className="mb-8 lg:hidden">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value || "all"}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {filteredItems && filteredItems.length > 0 ? (
              selectedCategory === undefined && groupedItems ? (
                // Grouped by category view
                <div className="space-y-16">
                  {Object.entries(groupedItems).map(
                    ([categoryKey, categoryData]) => (
                      <div key={categoryKey} className="space-y-8">
                        {/* Category Header */}
                        <div className="flex items-center gap-4">
                          <h2 className="text-3xl font-bold text-foreground">
                            {categoryData.label}
                          </h2>
                          <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
                          <div className="text-muted-foreground text-base">
                            {getVisibleItemsForCategory(categoryKey, categoryData.items).length === categoryData.items.length ? (
                              <span>
                                {categoryData.items.length} product{categoryData.items.length !== 1 ? "s" : ""}
                              </span>
                            ) : (
                              <span>
                                Showing {getVisibleItemsForCategory(categoryKey, categoryData.items).length} of {categoryData.items.length} product{categoryData.items.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Category Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                          {getVisibleItemsForCategory(categoryKey, categoryData.items).map((item) => (
                            <div
                              key={item._id}
                              className="bg-card/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 group h-full flex flex-col hover:shadow-lg relative"
                            >
                              {/* Product Image - Clickable */}
                              <Link href={`/marketplace/product/${item._id}`}>
                                <div className="h-80 bg-muted relative overflow-hidden cursor-pointer flex-shrink-0">
                                  {item.imageUrl ? (
                                    <Image
                                      src={item.imageUrl}
                                      alt={item.name}
                                      width={400}
                                      height={300}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                  )}

                                  {item.featured && (
                                    <div className="absolute top-4 left-4 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                                      <Star className="h-4 w-4 mr-1" />
                                      Featured
                                    </div>
                                  )}

                                  {item.stock === 0 && (
                                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                                      <span className="text-destructive font-bold text-lg">
                                        Out of Stock
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </Link>

                              {/* Product Info */}
                              <div className="p-6 flex-1 flex flex-col">
                                <Link href={`/marketplace/product/${item._id}`}>
                                  <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 hover:text-primary transition-colors cursor-pointer min-h-[3.5rem]">
                                    {item.name}
                                  </h3>
                                </Link>

                                <p className="text-muted-foreground text-base mb-6 line-clamp-2 flex-1 min-h-[3rem] leading-relaxed">
                                  {item.description}
                                </p>

                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="text-2xl font-bold text-foreground mb-2">
                                      {formatPrice(item.price)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {item.stock} in stock
                                    </p>
                                  </div>
                                </div>

                                {user ? (
                                  <Button
                                    onClick={() => handleAddToCart(item._id)}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-medium"
                                    disabled={
                                      item.stock === 0 ||
                                      addingToCart === item._id
                                    }
                                  >
                                    {addingToCart === item._id ? (
                                      <>Loading...</>
                                    ) : (
                                      <>
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        Add to Cart
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    asChild
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-medium"
                                  >
                                    <Link href="/sign-in">
                                      <ShoppingCart className="h-5 w-5 mr-2" />
                                      Sign In to Buy
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Load More Button */}
                        {hasMoreItemsForCategory(categoryKey, categoryData.items.length) && (
                          <div className="flex justify-center mt-8">
                            <Button
                              onClick={() => loadMoreForCategory(categoryKey)}
                              variant="outline"
                              className="px-8 py-3 text-base hover:bg-primary hover:text-primary-foreground"
                            >
                              Load More ({categoryData.items.length - getVisibleItemsForCategory(categoryKey, categoryData.items).length} remaining)
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                // Regular grid view for specific category
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-card/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 group h-full flex flex-col hover:shadow-lg relative"
                    >
                      {/* Product Image - Clickable */}
                      <Link href={`/marketplace/product/${item._id}`}>
                        <div className="h-80 bg-muted relative overflow-hidden cursor-pointer flex-shrink-0">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={400}
                              height={300}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}

                          {item.featured && (
                            <div className="absolute top-4 left-4 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                              <Star className="h-4 w-4 mr-1" />
                              Featured
                            </div>
                          )}

                          {item.stock === 0 && (
                            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                              <span className="text-destructive font-bold text-lg">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="mb-3">
                          <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                            {item.category}
                          </span>
                        </div>

                        <Link href={`/marketplace/product/${item._id}`}>
                          <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 hover:text-primary transition-colors cursor-pointer min-h-[3.5rem]">
                            {item.name}
                          </h3>
                        </Link>

                        <p className="text-muted-foreground text-base mb-6 line-clamp-2 flex-1 min-h-[3rem] leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <div className="text-2xl font-bold text-foreground mb-2">
                              {formatPrice(item.price)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.stock} in stock
                            </p>
                          </div>
                        </div>

                        {user ? (
                          <Button
                            onClick={() => handleAddToCart(item._id)}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-medium"
                            disabled={
                              item.stock === 0 || addingToCart === item._id
                            }
                          >
                            {addingToCart === item._id ? (
                              <>Loading...</>
                            ) : (
                              <>
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                Add to Cart
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            asChild
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-medium"
                          >
                            <Link href="/sign-in">
                              <ShoppingCart className="h-5 w-5 mr-2" />
                              Sign In to Buy
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-20">
                <ShoppingCart className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {items?.length === 0
                    ? "No Products Available"
                    : "No Products Found"}
                </h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  {items?.length === 0
                    ? "Our marketplace is being stocked with amazing products. Check back soon!"
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;

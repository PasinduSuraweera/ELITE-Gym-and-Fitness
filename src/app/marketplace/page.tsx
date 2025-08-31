"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Filter, Search, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const MarketplacePage = () => {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

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
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group items by category when showing all products
  const groupedItems =
    selectedCategory === undefined && filteredItems
      ? categories.slice(1).reduce(
          (acc, category) => {
            const categoryItems = filteredItems.filter(
              (item) => item.category === category.value
            );
            if (categoryItems.length > 0) {
              acc[category.value!] = {
                label: category.label,
                items: categoryItems,
              };
            }
            return acc;
          },
          {} as Record<string, { label: string; items: typeof filteredItems }>
        )
      : null;

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
      className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black"
      suppressHydrationWarning
    >
      {/* Background Effects */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"
        suppressHydrationWarning
      ></div>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]"
        suppressHydrationWarning
      ></div>

      <div
        className="container mx-auto px-4 py-32 relative z-10 flex-1"
        suppressHydrationWarning
      >
        {/* Header */}
        <div
          className="flex justify-between items-center mb-12"
          suppressHydrationWarning
        >
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-red-500">Fitness</span> Marketplace
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Shop premium fitness equipment, supplements, and gear to enhance
              your workout experience
            </p>
          </div>

          {/* Cart Button */}
          {user && (
            <Link href="/marketplace/cart">
              <Button className="relative bg-red-600 hover:bg-red-700 text-white px-6 py-3">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
                {cartSummary && cartSummary.totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-black text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {cartSummary.totalItems}
                  </span>
                )}
              </Button>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value || "all"}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? "bg-red-600 text-white"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
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
            <div className="space-y-12">
              {Object.entries(groupedItems).map(
                ([categoryKey, categoryData]) => (
                  <div key={categoryKey} className="space-y-6">
                    {/* Category Header */}
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold text-white">
                        {categoryData.label}
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-transparent"></div>
                      <span className="text-gray-400 text-sm">
                        {categoryData.items.length} product
                        {categoryData.items.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Category Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryData.items.map((item) => (
                        <div
                          key={item._id}
                          className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-red-500/50 transition-all duration-300 group h-full flex flex-col"
                        >
                          {/* Product Image - Clickable */}
                          <Link href={`/marketplace/product/${item._id}`}>
                            <div className="h-80 bg-gray-800 relative overflow-hidden cursor-pointer flex-shrink-0">
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
                                  <ShoppingCart className="h-12 w-12 text-gray-600" />
                                </div>
                              )}

                              {item.featured && (
                                <div className="absolute top-3 left-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </div>
                              )}

                              {item.stock === 0 && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                  <span className="text-red-400 font-bold">
                                    Out of Stock
                                  </span>
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* Product Info */}
                          <div className="p-4 flex-1 flex flex-col">
                            <Link href={`/marketplace/product/${item._id}`}>
                              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-red-400 transition-colors cursor-pointer min-h-[3.5rem]">
                                {item.name}
                              </h3>
                            </Link>

                            <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1 min-h-[2.5rem]">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex-1">
                                <div className="text-2xl font-bold text-white mb-1">
                                  {formatPrice(item.price)}
                                </div>
                                <p className="text-xs text-gray-400">
                                  {item.stock} in stock
                                </p>
                              </div>

                              {user ? (
                                <Button
                                  onClick={() => handleAddToCart(item._id)}
                                  className="bg-red-600 hover:bg-red-700 text-white ml-2 flex-shrink-0"
                                  disabled={
                                    item.stock === 0 ||
                                    addingToCart === item._id
                                  }
                                >
                                  {addingToCart === item._id ? (
                                    <>Loading...</>
                                  ) : (
                                    <>
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                      Add to Cart
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  asChild
                                  className="bg-red-600 hover:bg-red-700 text-white ml-2 flex-shrink-0"
                                >
                                  <Link href="/sign-in">
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Sign In to Buy
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            // Regular grid view for specific category
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-red-500/50 transition-all duration-300 group h-full flex flex-col"
                >
                  {/* Product Image - Clickable */}
                  <Link href={`/marketplace/product/${item._id}`}>
                    <div className="h-80 bg-gray-800 relative overflow-hidden cursor-pointer flex-shrink-0">
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
                          <ShoppingCart className="h-12 w-12 text-gray-600" />
                        </div>
                      )}

                      {item.featured && (
                        <div className="absolute top-3 left-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </div>
                      )}

                      {item.stock === 0 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-red-400 font-bold">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="mb-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    <Link href={`/marketplace/product/${item._id}`}>
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-red-400 transition-colors cursor-pointer min-h-[3.5rem]">
                        {item.name}
                      </h3>
                    </Link>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1 min-h-[2.5rem]">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-white mb-1">
                          {formatPrice(item.price)}
                        </div>
                        <p className="text-xs text-gray-400">
                          {item.stock} in stock
                        </p>
                      </div>

                      {user ? (
                        <Button
                          onClick={() => handleAddToCart(item._id)}
                          className="bg-red-600 hover:bg-red-700 text-white ml-2 flex-shrink-0"
                          disabled={
                            item.stock === 0 || addingToCart === item._id
                          }
                        >
                          {addingToCart === item._id ? (
                            <>Loading...</>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          asChild
                          className="bg-red-600 hover:bg-red-700 text-white ml-2 flex-shrink-0"
                        >
                          <Link href="/sign-in">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Sign In to Buy
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {items?.length === 0
                ? "No Products Available"
                : "No Products Found"}
            </h3>
            <p className="text-gray-400">
              {items?.length === 0
                ? "Our marketplace is being stocked with amazing products. Check back soon!"
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;

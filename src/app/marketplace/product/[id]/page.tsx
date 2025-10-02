"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Star,
  ArrowLeft,
  Plus,
  Minus,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ProductDetailPage = () => {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = useQuery(api.marketplace.getMarketplaceItemById, {
    itemId: productId as any,
  });

  // Get related products from the same category
  const relatedProducts = useQuery(
    api.marketplace.getMarketplaceItems,
    product ? { category: product.category } : "skip"
  );

  const cartSummary = useQuery(
    api.cart.getCartSummary,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const addToCart = useMutation(api.cart.addToCart);

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAddToCart = async () => {
    if (!user?.id || !product) return;

    setAddingToCart(true);
    try {
      await addToCart({
        clerkId: user.id,
        productId: product._id as any,
        quantity,
      });
      // Show success message or redirect to cart
      alert(`Added ${quantity} ${product.name}(s) to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding item to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Mock additional images - in real app, you'd have multiple images
  const productImages = [
    product.imageUrl || "/placeholder-product.jpg",
    // Add more images here when available
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/marketplace"
              className="hover:text-foreground transition-colors"
            >
              Marketplace
            </Link>
            {product?.category && (
              <>
                <span>/</span>
                <Link
                  href={`/marketplace?category=${product.category}`}
                  className="hover:text-foreground transition-colors capitalize"
                >
                  {product.category}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-xs">
              {product?.name}
            </span>
          </div>
        </nav>

        {/* Enhanced Back Button */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-border text-foreground hover:bg-accent hover:border-primary transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Marketplace
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-card rounded-lg overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={productImages[selectedImageIndex]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="h-20 w-20 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Thumbnail Images (if multiple images available) */}
            {productImages.length > 1 && (
              <div className="flex gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-18 h-18 rounded-lg overflow-hidden border-2 ${
                      index === selectedImageIndex
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={72}
                      height={72}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category and Featured Badge */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-accent text-foreground text-sm rounded-full capitalize">
                {product.category}
              </span>
              {product.featured && (
                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-black text-sm rounded-full font-medium">
                  <Star className="h-4 w-4" />
                  Featured
                </div>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {product.name}
            </h1>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </div>
              <div className="text-muted-foreground">
                {product.stock > 0 ? (
                  <span className="text-green-400">
                    ✓ {product.stock} in stock
                  </span>
                ) : (
                  <span className="text-red-400">✗ Out of stock</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Quantity</h3>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-accent"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-medium text-foreground px-4">
                    {quantity}
                  </span>
                  <Button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-accent"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {user ? (
                <div className="flex gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg"
                  >
                    {addingToCart ? (
                      <>Adding to Cart...</>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg"
                >
                  <Link href="/sign-in">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Sign In to Purchase
                  </Link>
                </Button>
              )}

              {/* Cart Link */}
              {user && cartSummary && cartSummary.totalItems > 0 && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-accent"
                >
                  <Link href="/marketplace/cart">
                    View Cart ({cartSummary.totalItems} items)
                  </Link>
                </Button>
              )}
            </div>

            {/* Product Features */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="h-5 w-5 text-primary" />
                  <span>Free shipping on orders over Rs. 5,000</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <span>30-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 1 && (
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Related Products
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
              <span className="text-muted-foreground text-sm capitalize">
                {product?.category} Collection
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts
                .filter((item) => item._id !== product?._id) // Exclude current product
                .slice(0, 4) // Show only 4 related products
                .map((item) => (
                  <Link
                    key={item._id}
                    href={`/marketplace/product/${item._id}`}
                    className="group"
                  >
                    <div className="bg-card/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                      {/* Product Image - Fixed Height */}
                      <div className="h-48 bg-accent relative overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}

                        {item.featured && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </div>
                        )}

                        {item.stock === 0 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="text-red-400 font-medium text-sm">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info - Flexible Height */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
                          {item.name}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1 min-h-[2.5rem]">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex-1">
                            <div className="text-xl font-bold text-foreground mb-1">
                              {formatPrice(item.price)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.stock} in stock
                            </p>
                          </div>

                          <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>

            {/* View All Products Button */}
            <div className="text-center mt-8">
              <Button
                asChild
                variant="outline"
                className="border-border text-foreground hover:bg-accent hover:border-primary"
              >
                <Link href={`/marketplace?category=${product?.category}`}>
                  View All {product?.category?.charAt(0).toUpperCase()}
                  {product?.category?.slice(1)} Products
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Floating Back Button for Mobile */}
        <Button
          onClick={() => router.back()}
          className="fixed bottom-6 right-6 md:hidden bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-14 h-14 shadow-lg z-50"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default ProductDetailPage;

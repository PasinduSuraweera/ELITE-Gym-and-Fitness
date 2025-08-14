"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  Package,
  DollarSign,
  TrendingUp
} from "lucide-react";

export default function MarketplaceAdminPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "supplements" as const,
    imageUrl: "",
    stock: 0,
    featured: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: number | undefined) => {
    if (!mounted || price === undefined) return '$0';
    try {
      return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      });
    } catch {
      return '$0';
    }
  };

  const items = useQuery(api.marketplace.getAllMarketplaceItems);
  const stats = useQuery(api.marketplace.getMarketplaceStats);
  const createItem = useMutation(api.marketplace.createMarketplaceItem);
  const updateItem = useMutation(api.marketplace.updateMarketplaceItem);
  const deleteItem = useMutation(api.marketplace.deleteMarketplaceItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateItem({
          itemId: editingItem._id,
          ...formData,
        });
      } else {
        await createItem(formData);
      }
      
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "supplements",
        imageUrl: "",
        stock: 0,
        featured: false,
      });
    } catch (error) {
      alert("Error: " + (error as Error).message);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl || "",
      stock: item.stock,
      featured: item.featured,
    });
    setShowModal(true);
  };

  const handleDelete = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem({ itemId: itemId as any });
      } catch (error) {
        alert("Error deleting item: " + (error as Error).message);
      }
    }
  };

  const toggleStatus = async (item: any) => {
    try {
      await updateItem({
        itemId: item._id,
        status: item.status === "active" ? "inactive" : "active",
      });
    } catch (error) {
      alert("Error updating status: " + (error as Error).message);
    }
  };

  const categories = [
    { value: "supplements", label: "Supplements" },
    { value: "equipment", label: "Equipment" },
    { value: "apparel", label: "Apparel" },
    { value: "accessories", label: "Accessories" },
    { value: "nutrition", label: "Nutrition" },
  ];

  return (
    <AdminLayout 
      title="Marketplace" 
      subtitle="Manage your gym's product catalog"
      showAddButton
      onAddClick={() => setShowModal(true)}
      addButtonText="Add Product"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-white">{stats?.totalItems || 0}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Items</p>
              <p className="text-2xl font-bold text-green-400">{stats?.activeItems || 0}</p>
            </div>
            <Eye className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Featured Items</p>
              <p className="text-2xl font-bold text-yellow-400">{stats?.featuredItems || 0}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-red-400">{formatPrice(stats?.totalValue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Products</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase">Price</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {items?.map((item) => (
                <tr key={item._id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-gray-400 text-sm line-clamp-1">{item.description}</p>
                        {item.featured && (
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            <span className="text-yellow-400 text-xs">Featured</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-gray-300">{item.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">${item.price}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${item.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "active" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(item)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title={item.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {item.status === "active" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!items || items.length === 0) && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingItem ? "Edit Product" : "Add New Product"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="featured" className="text-white">
                    Featured Product
                  </label>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-800">
                  <Button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {editingItem ? "Update Product" : "Add Product"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save, Package } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: any;
}

export function InventoryModal({ isOpen, onClose, editingItem }: InventoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "cardio",
    manufacturer: "",
    model: "",
    serialNumber: "",
    totalQuantity: 1,
    condition: "excellent",
    status: "active",
    purchaseDate: "",
    purchasePrice: "",
    vendor: "",
    warrantyExpiry: "",
    location: "",
    zone: "",
    minQuantityAlert: "",
    maxCapacity: "",
    imageUrl: "",
    manualUrl: "",
    tags: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addInventoryItem = useMutation(api.inventory.addInventoryItem);
  const updateInventoryItem = useMutation(api.inventory.updateInventoryItem);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || "",
        description: editingItem.description || "",
        category: editingItem.category || "cardio",
        manufacturer: editingItem.manufacturer || "",
        model: editingItem.model || "",
        serialNumber: editingItem.serialNumber || "",
        totalQuantity: editingItem.totalQuantity || 1,
        condition: editingItem.condition || "excellent",
        status: editingItem.status || "active",
        purchaseDate: editingItem.purchaseDate ? new Date(editingItem.purchaseDate).toISOString().split('T')[0] : "",
        purchasePrice: editingItem.purchasePrice?.toString() || "",
        vendor: editingItem.vendor || "",
        warrantyExpiry: editingItem.warrantyExpiry ? new Date(editingItem.warrantyExpiry).toISOString().split('T')[0] : "",
        location: editingItem.location || "",
        zone: editingItem.zone || "",
        minQuantityAlert: editingItem.minQuantityAlert?.toString() || "",
        maxCapacity: editingItem.maxCapacity?.toString() || "",
        imageUrl: editingItem.imageUrl || "",
        manualUrl: editingItem.manualUrl || "",
        tags: editingItem.tags?.join(", ") || "",
        notes: editingItem.notes || "",
      });
    } else {
      // Reset form for new item
      setFormData({
        name: "",
        description: "",
        category: "cardio",
        manufacturer: "",
        model: "",
        serialNumber: "",
        totalQuantity: 1,
        condition: "excellent",
        status: "active",
        purchaseDate: "",
        purchasePrice: "",
        vendor: "",
        warrantyExpiry: "",
        location: "",
        zone: "",
        minQuantityAlert: "",
        maxCapacity: "",
        imageUrl: "",
        manualUrl: "",
        tags: "",
        notes: "",
      });
    }
    setErrors({});
  }, [editingItem]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Equipment name is required";
    }

    if (formData.totalQuantity < 1) {
      newErrors.totalQuantity = "Total quantity must be at least 1";
    }

    if (formData.minQuantityAlert && Number(formData.minQuantityAlert) < 0) {
      newErrors.minQuantityAlert = "Minimum quantity alert cannot be negative";
    }

    if (formData.maxCapacity && Number(formData.maxCapacity) < formData.totalQuantity) {
      newErrors.maxCapacity = "Maximum capacity cannot be less than total quantity";
    }

    if (formData.purchasePrice && Number(formData.purchasePrice) < 0) {
      newErrors.purchasePrice = "Purchase price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category as any,
        manufacturer: formData.manufacturer.trim() || undefined,
        model: formData.model.trim() || undefined,
        serialNumber: formData.serialNumber.trim() || undefined,
        totalQuantity: formData.totalQuantity,
        condition: formData.condition as any,
        status: formData.status as any,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).getTime() : undefined,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
        vendor: formData.vendor.trim() || undefined,
        warrantyExpiry: formData.warrantyExpiry ? new Date(formData.warrantyExpiry).getTime() : undefined,
        location: formData.location.trim() || undefined,
        zone: formData.zone.trim() || undefined,
        minQuantityAlert: formData.minQuantityAlert ? Number(formData.minQuantityAlert) : undefined,
        maxCapacity: formData.maxCapacity ? Number(formData.maxCapacity) : undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        manualUrl: formData.manualUrl.trim() || undefined,
        tags: formData.tags.trim() ? formData.tags.split(",").map(tag => tag.trim()).filter(Boolean) : undefined,
        notes: formData.notes.trim() || undefined,
      };

      if (editingItem) {
        await updateInventoryItem({
          id: editingItem._id,
          ...submitData,
        });
        alert("✅ Equipment updated successfully!");
      } else {
        await addInventoryItem(submitData);
        alert("✅ Equipment added successfully!");
      }

      onClose();
    } catch (error) {
      console.error("Error saving equipment:", error);
      alert("❌ Error saving equipment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Package className="h-5 w-5" />
            {editingItem ? "Edit Equipment" : "Add New Equipment"}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-border text-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Equipment Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Treadmill Pro X1"
                  className={`border-border ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="cardio">Cardio</option>
                  <option value="strength">Strength</option>
                  <option value="free_weights">Free Weights</option>
                  <option value="functional">Functional</option>
                  <option value="accessories">Accessories</option>
                  <option value="safety">Safety</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the equipment..."
                className="border-border"
                rows={3}
              />
            </div>

            {/* Manufacturer Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer" className="text-foreground">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                  placeholder="e.g., Life Fitness"
                  className="border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-foreground">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  placeholder="e.g., X1-Pro-2024"
                  className="border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber" className="text-foreground">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                  placeholder="e.g., LF2024X1001"
                  className="border-border"
                />
              </div>
            </div>

            {/* Quantity and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalQuantity" className="text-foreground">Total Quantity *</Label>
                <Input
                  id="totalQuantity"
                  type="number"
                  min="1"
                  value={formData.totalQuantity}
                  onChange={(e) => handleInputChange("totalQuantity", Number(e.target.value))}
                  className={`border-border ${errors.totalQuantity ? "border-red-500" : ""}`}
                />
                {errors.totalQuantity && <span className="text-red-500 text-sm">{errors.totalQuantity}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition" className="text-foreground">Condition *</Label>
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => handleInputChange("condition", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="out_of_order">Out of Order</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-foreground">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>

            {/* Purchase Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate" className="text-foreground">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                  className="border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice" className="text-foreground">Purchase Price ($)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                  placeholder="0.00"
                  className={`border-border ${errors.purchasePrice ? "border-red-500" : ""}`}
                />
                {errors.purchasePrice && <span className="text-red-500 text-sm">{errors.purchasePrice}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor" className="text-foreground">Vendor</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange("vendor", e.target.value)}
                  placeholder="Equipment supplier"
                  className="border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warrantyExpiry" className="text-foreground">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => handleInputChange("warrantyExpiry", e.target.value)}
                  className="border-border"
                />
              </div>
            </div>

            {/* Location and Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g., Main Floor"
                  className="border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone" className="text-foreground">Zone</Label>
                <Input
                  id="zone"
                  value={formData.zone}
                  onChange={(e) => handleInputChange("zone", e.target.value)}
                  placeholder="e.g., Cardio Section"
                  className="border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minQuantityAlert" className="text-foreground">Min Quantity Alert</Label>
                <Input
                  id="minQuantityAlert"
                  type="number"
                  min="0"
                  value={formData.minQuantityAlert}
                  onChange={(e) => handleInputChange("minQuantityAlert", e.target.value)}
                  placeholder="Alert when below"
                  className={`border-border ${errors.minQuantityAlert ? "border-red-500" : ""}`}
                />
                {errors.minQuantityAlert && <span className="text-red-500 text-sm">{errors.minQuantityAlert}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxCapacity" className="text-foreground">Max Capacity</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  min="1"
                  value={formData.maxCapacity}
                  onChange={(e) => handleInputChange("maxCapacity", e.target.value)}
                  placeholder="Maximum usage"
                  className={`border-border ${errors.maxCapacity ? "border-red-500" : ""}`}
                />
                {errors.maxCapacity && <span className="text-red-500 text-sm">{errors.maxCapacity}</span>}
              </div>
            </div>

            {/* Links and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-foreground">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manualUrl" className="text-foreground">Manual URL</Label>
                <Input
                  id="manualUrl"
                  type="url"
                  value={formData.manualUrl}
                  onChange={(e) => handleInputChange("manualUrl", e.target.value)}
                  placeholder="https://example.com/manual.pdf"
                  className="border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-foreground">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
                placeholder="e.g., high-intensity, beginner-friendly, premium (comma-separated)"
                className="border-border"
              />
              <span className="text-xs text-muted-foreground">Separate multiple tags with commas</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes about this equipment..."
                className="border-border"
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="border-border text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    {editingItem ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingItem ? "Update Equipment" : "Add Equipment"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
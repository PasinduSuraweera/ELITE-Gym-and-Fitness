"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Wrench,
  Download
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { InventoryModal } from "@/components/InventoryModal";

export default function InventoryPage() {
  const { isSignedIn } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Queries
  const inventory = useQuery(
    api.inventory.getAllInventory, 
    isSignedIn ? undefined : "skip"
  );
  const inventoryStats = useQuery(
    api.inventory.getInventoryStats, 
    isSignedIn ? undefined : "skip"
  );
  const maintenanceAlerts = useQuery(
    api.inventory.getMaintenanceAlerts, 
    isSignedIn ? undefined : "skip"
  );

  // Mutations
  const deleteInventoryItem = useMutation(api.inventory.deleteInventoryItem);
  const updateEquipmentUsage = useMutation(api.inventory.updateEquipmentUsage);

  if (!mounted || !isSignedIn) {
    return (
      <AdminLayout title="Inventory Management">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-card rounded-lg"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Filter inventory based on search and filters
  const filteredInventory = inventory?.filter((item: any) => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
  }) || [];

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300";
      case "inactive": return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300";
      case "maintenance": return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "retired": return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent": return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300";
      case "good": return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300";
      case "fair": return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "poor": return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300";
      case "out_of_order": return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getCategoryIcon = () => {
    // You can add category-specific icons here
    return <Package className="h-4 w-4" />;
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this inventory item? This action cannot be undone.")) {
      try {
        await deleteInventoryItem({ id: id as any });
        alert("✅ Inventory item deleted successfully");
      } catch (error) {
        console.error("Error deleting inventory item:", error);
        alert("❌ Error deleting inventory item. Please try again.");
      }
    }
  };

  const handleQuickAction = async (id: string, action: "check_out" | "check_in" | "maintenance") => {
    try {
      await updateEquipmentUsage({
        id: id as any,
        action,
        quantity: 1
      });
      alert(`✅ Equipment ${action.replace('_', ' ')} completed successfully`);
    } catch (error) {
      console.error(`Error with ${action}:`, error);
      alert(`❌ Error with equipment ${action.replace('_', ' ')}. Please try again.`);
    }
  };

  return (
    <AdminLayout title="Inventory Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage gym equipment inventory, track usage, and monitor maintenance
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-accent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => {
                setEditingItem(null);
                setShowModal(true);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {inventoryStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Equipment</p>
                    <p className="text-2xl font-bold text-foreground">{inventoryStats.totalItems}</p>
                    <p className="text-xs text-muted-foreground">
                      {inventoryStats.totalQuantity} units total
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold text-green-600">{inventoryStats.availableQuantity}</p>
                    <p className="text-xs text-muted-foreground">
                      {inventoryStats.inUseQuantity} in use
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Maintenance</p>
                    <p className="text-2xl font-bold text-yellow-600">{inventoryStats.maintenanceQuantity}</p>
                    <p className="text-xs text-muted-foreground">
                      {inventoryStats.maintenanceNeeded} need service
                    </p>
                  </div>
                  <Wrench className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Alerts</p>
                    <p className="text-2xl font-bold text-red-600">
                      {inventoryStats.lowStockItems + inventoryStats.outOfOrderItems}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {inventoryStats.lowStockItems} low stock
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts Section */}
        {maintenanceAlerts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {maintenanceAlerts.overdue.length > 0 && (
              <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Overdue Maintenance ({maintenanceAlerts.overdue.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {maintenanceAlerts.overdue.slice(0, 3).map((item: any) => (
                      <div key={item._id} className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-xs text-red-600 dark:text-red-400">
                          {formatDate(item.nextMaintenanceDate)}
                        </span>
                      </div>
                    ))}
                    {maintenanceAlerts.overdue.length > 3 && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        +{maintenanceAlerts.overdue.length - 3} more items
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {maintenanceAlerts.lowStock.length > 0 && (
              <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Low Stock Items ({maintenanceAlerts.lowStock.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {maintenanceAlerts.lowStock.slice(0, 3).map((item: any) => (
                      <div key={item._id} className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">
                          {item.availableQuantity} left
                        </span>
                      </div>
                    ))}
                    {maintenanceAlerts.lowStock.length > 3 && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        +{maintenanceAlerts.lowStock.length - 3} more items
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Filters */}
        <Card className="bg-card/50 border-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-border"
                  />
                </div>
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Categories</option>
                <option value="cardio">Cardio</option>
                <option value="strength">Strength</option>
                <option value="free_weights">Free Weights</option>
                <option value="functional">Functional</option>
                <option value="accessories">Accessories</option>
                <option value="safety">Safety</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>

              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Conditions</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="out_of_order">Out of Order</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Package className="h-5 w-5" />
              Equipment Inventory ({filteredInventory.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInventory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-foreground font-medium">Equipment</th>
                      <th className="text-left p-3 text-foreground font-medium">Category</th>
                      <th className="text-left p-3 text-foreground font-medium">Quantity</th>
                      <th className="text-left p-3 text-foreground font-medium">Condition</th>
                      <th className="text-left p-3 text-foreground font-medium">Status</th>
                      <th className="text-left p-3 text-foreground font-medium">Location</th>
                      <th className="text-left p-3 text-foreground font-medium">Last Maintenance</th>
                      <th className="text-right p-3 text-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item: any) => (
                      <tr key={item._id} className="border-b border-border hover:bg-accent/50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium text-foreground">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.manufacturer} {item.model}
                            </div>
                            {item.serialNumber && (
                              <div className="text-xs text-muted-foreground">
                                SN: {item.serialNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon()}
                            <span className="text-foreground capitalize">
                              {item.category.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-foreground">
                            <div className="font-medium">{item.availableQuantity}/{item.totalQuantity}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.inUseQuantity} in use
                              {item.maintenanceQuantity > 0 && `, ${item.maintenanceQuantity} maintenance`}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={`${getConditionColor(item.condition)} border`}>
                            {item.condition.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={`${getStatusColor(item.status)} border`}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-foreground">
                            {item.location || "Unassigned"}
                            {item.zone && (
                              <div className="text-xs text-muted-foreground">Zone: {item.zone}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-foreground">
                            {formatDate(item.lastMaintenanceDate)}
                            {item.nextMaintenanceDate && (
                              <div className="text-xs text-muted-foreground">
                                Next: {formatDate(item.nextMaintenanceDate)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-border hover:bg-accent"
                              onClick={() => {
                                setEditingItem(item);
                                setShowModal(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            
                            {item.status === "active" && item.availableQuantity > 0 && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-xs border-green-500 text-green-600 hover:bg-green-50"
                                  onClick={() => handleQuickAction(item._id, "check_out")}
                                >
                                  Out
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-xs border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                                  onClick={() => handleQuickAction(item._id, "maintenance")}
                                >
                                  Maint
                                </Button>
                              </>
                            )}
                            
                            {item.inUseQuantity > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-xs border-blue-500 text-blue-600 hover:bg-blue-50"
                                onClick={() => handleQuickAction(item._id, "check_in")}
                              >
                                In
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(item._id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Equipment Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || categoryFilter !== "all" || statusFilter !== "all" || conditionFilter !== "all"
                    ? "No equipment matches your current filters."
                    : "Start by adding your first piece of equipment to the inventory."
                  }
                </p>
                <Button
                  onClick={() => {
                    setEditingItem(null);
                    setShowModal(true);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Component */}
        {showModal && (
          <InventoryModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingItem(null);
            }}
            editingItem={editingItem}
          />
        )}
      </div>
    </AdminLayout>
  );
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockCategories, getExpensesByCategory } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Folder } from 'lucide-react';

const Categories = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#3b82f6');
  const { toast } = useToast();

  const predefinedColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast({
        title: "Validation error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Replace mock with backend API call
      const categoryData = {
        name: categoryName.trim(),
        color: categoryColor,
        id: editingCategory?.id || Date.now().toString()
      };

      console.log(`${editingCategory ? 'Updating' : 'Creating'} category:`, categoryData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: `Category ${editingCategory ? 'updated' : 'created'}`,
        description: `"${categoryName}" has been ${editingCategory ? 'updated' : 'created'} successfully`,
      });

      // Reset form
      setCategoryName('');
      setCategoryColor('#3b82f6');
      setEditingCategory(null);
      setIsDialogOpen(false);
      
      // In real app, this would trigger a re-fetch of categories
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingCategory ? 'update' : 'create'} category`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryColor(category.color);
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    // Check if category has expenses
    const categoryExpenses = getExpensesByCategory(categoryId);
    
    if (categoryExpenses.length > 0) {
      toast({
        title: "Cannot delete category",
        description: `"${categoryName}" has ${categoryExpenses.length} expense(s). Please reassign or delete them first.`,
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      try {
        // TODO: Replace mock with backend API call
        console.log('Deleting category:', categoryId);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast({
          title: "Category deleted",
          description: `"${categoryName}" has been deleted successfully`,
        });
        
        // In real app, this would trigger a re-fetch of categories
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setCategoryName('');
    setCategoryColor('#3b82f6');
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-gray-600">Organize your expenses with custom categories</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-8 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        categoryColor === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCategoryColor(color)}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="w-full h-12"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCategories.map((category) => {
          const categoryExpenses = getExpensesByCategory(category.id);
          const totalAmount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
          
          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id, category.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Spent:</span>
                    <span className="font-semibold text-lg">${totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Transactions:</span>
                    <span className="font-medium">{categoryExpenses.length}</span>
                  </div>

                  {category.budget && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Budget:</span>
                      <span className="font-medium">${category.budget.toFixed(2)}</span>
                    </div>
                  )}

                  {categoryExpenses.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Avg per Transaction:</span>
                      <span className="font-medium">
                        ${(totalAmount / categoryExpenses.length).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Folder className="h-5 w-5" />
            <span>Category Usage Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCategories
              .map(category => ({
                ...category,
                expenses: getExpensesByCategory(category.id),
                total: getExpensesByCategory(category.id).reduce((sum, expense) => sum + expense.amount, 0)
              }))
              .sort((a, b) => b.total - a.total)
              .map((category, index) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 w-8">#{index + 1}</span>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${category.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{category.expenses.length} transactions</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Categories;

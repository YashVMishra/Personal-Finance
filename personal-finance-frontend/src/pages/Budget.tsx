
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockBudgets, mockCategories, getCategoryById, getTotalExpensesByCategory } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save, X } from 'lucide-react';

const Budget = () => {
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const { toast } = useToast();

  // TODO: Replace mock with backend API call
  const expensesByCategory = getTotalExpensesByCategory();

  const handleEditStart = (budgetId: string, currentAmount: number) => {
    setEditingBudget(budgetId);
    setEditValue(currentAmount.toString());
  };

  const handleEditSave = async (budgetId: string, categoryName: string) => {
    const newAmount = parseFloat(editValue);
    
    if (isNaN(newAmount) || newAmount < 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Replace mock with backend API call
      console.log('Updating budget:', { budgetId, newAmount });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Budget updated",
        description: `${categoryName} budget updated to $${newAmount.toFixed(2)}`,
      });
      
      setEditingBudget(null);
      // In real app, this would trigger a re-fetch of budgets
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      });
    }
  };

  const handleEditCancel = () => {
    setEditingBudget(null);
    setEditValue('');
  };

  const totalBudget = mockBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
  const totalBudgetUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Budget Management</h1>
        <p className="text-gray-600">Set and track your monthly spending limits</p>
      </div>

      {/* Overall Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-3xl font-bold text-primary-600">${totalBudget.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-3xl font-bold text-red-600">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-3xl font-bold text-green-600">${(totalBudget - totalSpent).toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Budget Usage</span>
              <span>{totalBudgetUsed.toFixed(1)}%</span>
            </div>
            <Progress 
              value={totalBudgetUsed} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBudgets.map((budget) => {
          const category = getCategoryById(budget.categoryId);
          const spent = expensesByCategory[budget.categoryId] || 0;
          const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          const isOverBudget = spent > budget.amount;
          const isEditing = editingBudget === budget.id;

          return (
            <Card key={budget.id} className={isOverBudget ? 'border-red-200' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category?.color }}
                    />
                    <CardTitle className="text-lg">{category?.name}</CardTitle>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStart(budget.id, budget.amount)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Budget Amount */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Budget:</span>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-24 h-8 pl-6 text-sm"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleEditSave(budget.id, category?.name || '')}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="font-semibold">${budget.amount.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Spent Amount */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Spent:</span>
                    <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                      ${spent.toFixed(2)}
                    </span>
                  </div>

                  {/* Remaining Amount */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Remaining:</span>
                    <span className={`font-semibold ${(budget.amount - spent) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${(budget.amount - spent).toFixed(2)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Usage</span>
                      <span className={isOverBudget ? 'text-red-600' : ''}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                    />
                    {isOverBudget && (
                      <p className="text-xs text-red-600 mt-1">
                        Over budget by ${(spent - budget.amount).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Budget Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Review and adjust your budgets monthly based on your spending patterns</p>
            <p>• Try to keep essential categories (like Bills & Utilities) well-funded</p>
            <p>• Set aside some budget for unexpected expenses</p>
            <p>• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Budget;

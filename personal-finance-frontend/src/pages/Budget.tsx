import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
// REMOVE/COMMENT OUT: import { mockBudgets, mockCategories, getCategoryById, getTotalExpensesByCategory } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// --- Interfaces (ensure these are consistent with your backend DTOs) ---
interface Category {
  id: string; // or number
  name: string;
  color: string;
}

interface BudgetData { // For displaying and for PUT payload (subset of fields)
  id: string; // or number
  categoryId: string; // or number
  amount: number;
  year: number;
  month: number; // 1-12
  // 'spent' will be calculated client-side or fetched if backend provides it
}

interface Expense {
  id: string; // or number
  amount: number;
  categoryId: string; // or number
  date: string; // YYYY-MM-DD
}
// --- End Interfaces ---

// API base URL
const API_BASE_URL = '/api';

// Helper function to get the auth token
const getAuthToken = () => localStorage.getItem('authToken');

// --- API Functions ---
const fetchCategories = async (): Promise<Category[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

const fetchBudgets = async (year: number, month: number): Promise<BudgetData[]> => {
  const token = getAuthToken();
  // Adjust API endpoint as needed, e.g., /api/budgets?year=2024&month=7
  const response = await fetch(`${API_BASE_URL}/budgets?year=${year}&month=${month}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch budgets');
  return response.json();
};

const fetchExpenses = async (year: number, month: number): Promise<Expense[]> => {
  const token = getAuthToken();
  // Fetch expenses for the given month to calculate spending
  // Example: /api/expenses?startDate=YYYY-MM-01&endDate=YYYY-MM-DD (last day of month)
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate(); // month is 1-indexed for API, 0-indexed for Date constructor month
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const response = await fetch(`${API_BASE_URL}/expenses?startDate=${startDate}&endDate=${endDate}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch expenses');
  return response.json();
};

const updateBudget = async (budget: { id: string, amount: number }): Promise<BudgetData> => {
  const token = getAuthToken();
  // Assuming your backend DTO for budget update only needs amount,
  // or if it needs more, adjust the payload.
  // The backend should handle which year/month this budget ID pertains to.
  const response = await fetch(`${API_BASE_URL}/budgets/${budget.id}`, { // Or a more specific endpoint if your API updates by category/month/year
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    // Send only the amount if that's what your endpoint expects for an update by ID.
    // If your endpoint expects categoryId, year, month for an update (e.g. POST to /api/budgets to upsert),
    // then you'll need to pass the full budget object.
    // For this example, assuming PUT to /api/budgets/{id} updates the amount of that specific budget entry.
    body: JSON.stringify({ amount: budget.amount }),
  });
  if (!response.ok) throw new Error('Failed to update budget');
  return response.json();
};
// --- End API Functions ---


const Budget = () => {
  const [editingBudget, setEditingBudget] = useState<string | null>(null); // Stores ID of budget being edited
  const [editValue, setEditValue] = useState('');
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // For simplicity, using current year and month. Consider adding selectors for these.
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: !!token,
  });

  const { data: budgets = [], isLoading: isLoadingBudgets } = useQuery<BudgetData[], Error>({
    queryKey: ['budgets', currentYear, currentMonth],
    queryFn: () => fetchBudgets(currentYear, currentMonth),
    enabled: !!token,
  });

  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery<Expense[], Error>({
    queryKey: ['expenses', currentYear, currentMonth, 'forBudgetPage'], // Unique key part
    queryFn: () => fetchExpenses(currentYear, currentMonth),
    enabled: !!token,
  });

  const budgetUpdateMutation = useMutation<BudgetData, Error, { id: string, amount: number }>({
    mutationFn: updateBudget,
    onSuccess: (updatedBudgetData) => {
      toast({
        title: "Budget updated",
        description: `Budget for category updated to $${updatedBudgetData.amount.toFixed(2)}`,
      });
      queryClient.invalidateQueries({ queryKey: ['budgets', currentYear, currentMonth] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }); // If dashboard uses budgets
      setEditingBudget(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update budget",
        variant: "destructive",
      });
    },
  });

  // Calculate expenses by category from fetched expenses
  const expensesByCategory = React.useMemo(() => {
    if (isLoadingExpenses || !expenses) return {};
    return expenses.reduce((acc, expense) => {
      acc[expense.categoryId] = (acc[expense.categoryId] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });
  }, [expenses, isLoadingExpenses]);

  // REMOVE/COMMENT OUT: const expensesByCategory = getTotalExpensesByCategory(); // Mock data

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
    budgetUpdateMutation.mutate({ id: budgetId, amount: newAmount });
    // REMOVE/COMMENT OUT MOCK LOGIC
    // try {
    //   console.log('Updating budget:', { budgetId, newAmount });
    //   await new Promise(resolve => setTimeout(resolve, 500));
    //   toast({
    //     title: "Budget updated",
    //     description: `${categoryName} budget updated to $${newAmount.toFixed(2)}`,
    //   });
    //   setEditingBudget(null);
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "Failed to update budget",
    //     variant: "destructive",
    //   });
    // }
    // REMOVE/COMMENT OUT UNTIL HERE
  };

  const handleEditCancel = () => {
    setEditingBudget(null);
    setEditValue('');
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(cat => cat.id === id);
  };


  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  // REMOVE/COMMENT OUT: const totalBudget = mockBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
  const totalBudgetUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (isLoadingCategories || isLoadingBudgets || isLoadingExpenses) {
    return <div>Loading budget data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Budget Management</h1>
        <p className="text-gray-600">Set and track your monthly spending limits for {currentMonth}/{currentYear}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Overall Budget Summary</CardTitle></CardHeader>
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
            <Progress value={totalBudgetUsed} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* REPLACE mockBudgets.map with budgets.map */}
        {budgets.map((budget) => {
          const category = getCategoryById(budget.categoryId);
          const spent = expensesByCategory[budget.categoryId] || 0;
          const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          const isOverBudget = spent > budget.amount;
          const isEditingCurrent = editingBudget === budget.id.toString();

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
                  {!isEditingCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStart(budget.id.toString(), budget.amount)}
                      disabled={budgetUpdateMutation.isPending}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Budget:</span>
                    {isEditingCurrent ? (
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-24 h-8 pl-6 text-sm"
                            disabled={budgetUpdateMutation.isPending}
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleEditSave(budget.id.toString(), category?.name || '')}
                          className="h-8 w-8 p-0"
                          disabled={budgetUpdateMutation.isPending}
                        >
                          {budgetUpdateMutation.isPending ? "..." : <Save className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                          className="h-8 w-8 p-0"
                          disabled={budgetUpdateMutation.isPending}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="font-semibold">${budget.amount.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Spent:</span>
                    <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                      ${spent.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Remaining:</span>
                    <span className={`font-semibold ${(budget.amount - spent) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${(budget.amount - spent).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Usage</span>
                      <span className={isOverBudget ? 'text-red-600' : ''}>{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                    {isOverBudget && (
                      <p className="text-xs text-red-600 mt-1">Over budget by ${(spent - budget.amount).toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Budget Tips</CardTitle></CardHeader>
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

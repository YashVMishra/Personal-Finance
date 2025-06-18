
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  budget?: number;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  userId: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM format
  spent: number;
}

// Mock User Data
export const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com"
};

// Mock Categories
export const mockCategories: Category[] = [
  { id: "1", name: "Food & Dining", color: "#ef4444", budget: 600 },
  { id: "2", name: "Transportation", color: "#3b82f6", budget: 400 },
  { id: "3", name: "Shopping", color: "#8b5cf6", budget: 300 },
  { id: "4", name: "Entertainment", color: "#f59e0b", budget: 200 },
  { id: "5", name: "Bills & Utilities", color: "#10b981", budget: 800 },
  { id: "6", name: "Healthcare", color: "#06b6d4", budget: 150 },
  { id: "7", name: "Travel", color: "#84cc16", budget: 500 },
  { id: "8", name: "Education", color: "#ec4899", budget: 250 }
];

// Mock Expenses
export const mockExpenses: Expense[] = [
  { id: "1", amount: 45.50, description: "Lunch at restaurant", categoryId: "1", date: "2024-06-15", userId: "1" },
  { id: "2", amount: 25.00, description: "Gas station", categoryId: "2", date: "2024-06-14", userId: "1" },
  { id: "3", amount: 120.00, description: "Grocery shopping", categoryId: "1", date: "2024-06-13", userId: "1" },
  { id: "4", amount: 15.99, description: "Netflix subscription", categoryId: "4", date: "2024-06-12", userId: "1" },
  { id: "5", amount: 85.00, description: "Electric bill", categoryId: "5", date: "2024-06-11", userId: "1" },
  { id: "6", amount: 200.00, description: "New shoes", categoryId: "3", date: "2024-06-10", userId: "1" },
  { id: "7", amount: 30.00, description: "Doctor visit", categoryId: "6", date: "2024-06-09", userId: "1" },
  { id: "8", amount: 75.00, description: "Concert tickets", categoryId: "4", date: "2024-06-08", userId: "1" },
  { id: "9", amount: 12.50, description: "Coffee", categoryId: "1", date: "2024-06-07", userId: "1" },
  { id: "10", amount: 40.00, description: "Uber ride", categoryId: "2", date: "2024-06-06", userId: "1" }
];

// Mock Budgets
export const mockBudgets: Budget[] = [
  { id: "1", categoryId: "1", amount: 600, month: "2024-06", spent: 178 },
  { id: "2", categoryId: "2", amount: 400, month: "2024-06", spent: 65 },
  { id: "3", categoryId: "3", amount: 300, month: "2024-06", spent: 200 },
  { id: "4", categoryId: "4", amount: 200, month: "2024-06", spent: 90.99 },
  { id: "5", categoryId: "5", amount: 800, month: "2024-06", spent: 85 },
  { id: "6", categoryId: "6", amount: 150, month: "2024-06", spent: 30 },
  { id: "7", categoryId: "7", amount: 500, month: "2024-06", spent: 0 },
  { id: "8", categoryId: "8", amount: 250, month: "2024-06", spent: 0 }
];

// Helper functions
export const getCategoryById = (id: string): Category | undefined => {
  return mockCategories.find(cat => cat.id === id);
};

export const getExpensesByCategory = (categoryId: string): Expense[] => {
  return mockExpenses.filter(expense => expense.categoryId === categoryId);
};

export const getTotalExpensesByCategory = (): { [key: string]: number } => {
  const totals: { [key: string]: number } = {};
  mockExpenses.forEach(expense => {
    if (!totals[expense.categoryId]) {
      totals[expense.categoryId] = 0;
    }
    totals[expense.categoryId] += expense.amount;
  });
  return totals;
};

export const getTotalExpenses = (): number => {
  return mockExpenses.reduce((total, expense) => total + expense.amount, 0);
};

export const getTotalBudget = (): number => {
  return mockBudgets.reduce((total, budget) => total + budget.amount, 0);
};

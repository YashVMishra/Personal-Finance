import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// REMOVE/COMMENT OUT: import { mockCategories, mockExpenses, Expense } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; // To get the auth token
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define interfaces for Category and Expense if not already globally available
interface Category {
  id: string; // or number
  name: string;
  color: string;
}

interface ExpenseData { // For POST/PUT payload
  amount: number;
  description: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  // userId will be handled by backend based on JWT
}

interface Expense extends ExpenseData { // For GET response
  id: string; // or number
  userId: string; // or number
}

// API base URL
const API_BASE_URL = '/api';

// Helper function to get the auth token (replace with your actual token retrieval logic)
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

const fetchExpenseById = async (id: string): Promise<Expense> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`Failed to fetch expense with id ${id}`);
  return response.json();
};

const createExpense = async (expenseData: ExpenseData): Promise<Expense> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(expenseData),
  });
  if (!response.ok) throw new Error('Failed to create expense');
  return response.json();
};

const updateExpense = async ({ id, expenseData }: { id: string, expenseData: ExpenseData }): Promise<Expense> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(expenseData),
  });
  if (!response.ok) throw new Error('Failed to update expense');
  return response.json();
};
// --- End API Functions ---


const AddExpense = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  // REMOVE/COMMENT OUT: const [isLoading, setIsLoading] = useState(false); // useMutation handles loading state

  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;
  const queryClient = useQueryClient();
  const { token } = useAuth(); // Get token for API calls

  // Fetch categories using react-query
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: !!token, // Only fetch if token is available
  });

  // Fetch expense data if in edit mode
  const { data: existingExpense, isLoading: isLoadingExistingExpense } = useQuery<Expense, Error>({
    queryKey: ['expense', editId],
    queryFn: () => fetchExpenseById(editId!),
    enabled: isEditing && !!token, // Only fetch if editing and token is available
  });

  useEffect(() => {
    if (isEditing && existingExpense) {
      setAmount(existingExpense.amount.toString());
      setDescription(existingExpense.description);
      setCategoryId(existingExpense.categoryId);
      setDate(new Date(existingExpense.date + 'T00:00:00')); // Ensure date is parsed correctly for local timezone
    }
    // REMOVE/COMMENT OUT MOCK DATA LOGIC:
    // if (isEditing) {
    //   const expense = mockExpenses.find(e => e.id === editId);
    //   if (expense) {
    //     setAmount(expense.amount.toString());
    //     setDescription(expense.description);
    //     setCategoryId(expense.categoryId);
    //     setDate(new Date(expense.date));
    //   }
    // }
  }, [isEditing, existingExpense]);

  const mutation = useMutation<Expense, Error, ExpenseData, unknown>({
    mutationFn: (newExpenseData: ExpenseData) => {
      if (isEditing && editId) {
        return updateExpense({ id: editId, expenseData: newExpenseData });
      } else {
        return createExpense(newExpenseData);
      }
    },
    onSuccess: () => {
      toast({
        title: `Expense ${isEditing ? 'updated' : 'added'} successfully`,
        description: `${description} - $${amount}`,
      });
      queryClient.invalidateQueries({ queryKey: ['expenses'] }); // Invalidate expenses list to refetch
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }); // Invalidate dashboard too
      navigate('/expenses');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'add'} expense`,
        variant: "destructive",
      });
    },
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !description || !categoryId || !date) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0) {
      toast({
        title: "Validation error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    const expensePayload: ExpenseData = {
      amount: parsedAmount,
      description,
      categoryId,
      date: format(date, 'yyyy-MM-dd'),
      // userId: '1' // REMOVE/COMMENT OUT: This would come from auth context in real app (backend handles it)
    };

    mutation.mutate(expensePayload);

    // REMOVE/COMMENT OUT MOCK SUBMISSION LOGIC
    // setIsLoading(true);
    // try {
    //   const expenseData: Omit<Expense, 'id'> = {
    //     amount: parseFloat(amount),
    //     description,
    //     categoryId,
    //     date: format(date, 'yyyy-MM-dd'),
    //     userId: '1' // This would come from auth context in real app
    //   };
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    //   console.log(`${isEditing ? 'Updating' : 'Creating'} expense:`, expenseData);
    //   toast({
    //     title: `Expense ${isEditing ? 'updated' : 'added'} successfully`,
    //     description: `${description} - $${amount}`,
    //   });
    //   navigate('/expenses');
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: `Failed to ${isEditing ? 'update' : 'add'} expense`,
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
    // REMOVE/COMMENT OUT UNTIL HERE
  };

  if (isLoadingCategories || (isEditing && isLoadingExistingExpense)) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Expense' : 'Add New Expense'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* REPLACE MOCK CATEGORIES WITH FETCHED DATA */}
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter expense description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex space-x-4 pt-6">
              <Button
                type="submit"
                className="flex-1"
                disabled={mutation.isPending} // Use isPending from useMutation
              >
                {mutation.isPending // Use isPending from useMutation
                  ? `${isEditing ? 'Updating' : 'Adding'}...`
                  : `${isEditing ? 'Update' : 'Add'} Expense`
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/expenses')}
                className="flex-1"
                disabled={mutation.isPending} // Use isPending from useMutation
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExpense;

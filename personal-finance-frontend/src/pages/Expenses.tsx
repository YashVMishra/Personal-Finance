
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockExpenses, mockCategories, getCategoryById } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // TODO: Replace mock with backend API call
  const filteredAndSortedExpenses = mockExpenses
    .filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || expense.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'category':
          aValue = getCategoryById(a.categoryId)?.name.toLowerCase() || '';
          bValue = getCategoryById(b.categoryId)?.name.toLowerCase() || '';
          break;
        default: // date
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleEdit = (expenseId: string) => {
    navigate(`/add-expense?edit=${expenseId}`);
  };

  const handleDelete = async (expenseId: string, description: string) => {
    if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
      try {
        // TODO: Replace mock with backend API call
        console.log('Deleting expense:', expenseId);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast({
          title: "Expense deleted",
          description: `"${description}" has been deleted successfully`,
        });
        
        // In real app, this would trigger a re-fetch of expenses
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete expense",
          variant: "destructive",
        });
      }
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const totalAmount = filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <p className="text-gray-600">Manage and track your expenses</p>
        </div>
        <Button onClick={() => navigate('/add-expense')} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {mockCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="description">Description</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-semibold">${totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Number of Transactions</p>
              <p className="text-2xl font-semibold">{filteredAndSortedExpenses.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Amount</p>
              <p className="text-2xl font-semibold">
                ${filteredAndSortedExpenses.length > 0 
                  ? (totalAmount / filteredAndSortedExpenses.length).toFixed(2) 
                  : '0.00'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('description')}
                  >
                    Description {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('category')}
                  >
                    Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 text-right"
                    onClick={() => handleSort('amount')}
                  >
                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedExpenses.map((expense) => {
                  const category = getCategoryById(expense.categoryId);
                  return (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category?.color }}
                          />
                          <span>{category?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${expense.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(expense.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(expense.id, expense.description)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {filteredAndSortedExpenses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No expenses found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;

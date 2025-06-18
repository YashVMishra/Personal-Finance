
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { mockExpenses, mockCategories, getCategoryById } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

const Reports = () => {
  const [reportType, setReportType] = useState('monthly');
  const [timeRange, setTimeRange] = useState('6months');
  const { toast } = useToast();

  // TODO: Replace mock with backend API call
  const generateMonthlyData = () => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthExpenses = mockExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });

      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        month: format(month, 'MMM yyyy'),
        amount: total,
        transactions: monthExpenses.length
      };
    });
  };

  const generateCategoryData = () => {
    const categoryTotals = mockCategories.map(category => {
      const categoryExpenses = mockExpenses.filter(expense => expense.categoryId === category.id);
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        name: category.name,
        amount: total,
        transactions: categoryExpenses.length,
        color: category.color
      };
    }).filter(item => item.amount > 0);

    return categoryTotals.sort((a, b) => b.amount - a.amount);
  };

  const monthlyData = generateMonthlyData();
  const categoryData = generateCategoryData();

  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageMonthly = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0;
  const highestMonth = monthlyData.reduce((max, month) => month.amount > max.amount ? month : max, monthlyData[0] || { amount: 0, month: '' });

  const handleExportCSV = () => {
    // TODO: Replace mock with backend API call
    const csvContent = [
      ['Date', 'Description', 'Category', 'Amount'],
      ...mockExpenses.map(expense => [
        expense.date,
        expense.description,
        getCategoryById(expense.categoryId)?.name || 'Unknown',
        expense.amount.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "CSV file has been downloaded",
    });
  };

  const handleExportPDF = () => {
    // TODO: Replace mock with backend API call
    toast({
      title: "PDF Export",
      description: "PDF export functionality would be implemented with a PDF library",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
          <p className="text-gray-600">Analyze your spending patterns and trends</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportCSV} className="flex items-center space-x-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Trends</SelectItem>
                  <SelectItem value="category">Category Breakdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageMonthly.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${highestMonth.amount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{highestMonth.month}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {reportType === 'monthly' ? (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  name="Monthly Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reportType === 'monthly' ? 'Monthly Breakdown' : 'Category Breakdown'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">
                    {reportType === 'monthly' ? 'Month' : 'Category'}
                  </th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-right py-2">Transactions</th>
                  <th className="text-right py-2">Avg per Transaction</th>
                </tr>
              </thead>
              <tbody>
                {(reportType === 'monthly' ? monthlyData : categoryData).map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        {reportType === 'category' && (
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: (item as any).color }}
                          />
                        )}
                        <span className="font-medium">
                          {reportType === 'monthly' ? (item as any).month : (item as any).name}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-3 font-semibold">
                      ${(item as any).amount.toFixed(2)}
                    </td>
                    <td className="text-right py-3">
                      {(item as any).transactions}
                    </td>
                    <td className="text-right py-3">
                      ${(item as any).transactions > 0 
                        ? ((item as any).amount / (item as any).transactions).toFixed(2) 
                        : '0.00'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;

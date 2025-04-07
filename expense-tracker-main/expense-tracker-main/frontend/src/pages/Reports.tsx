import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Restaurant as RestaurantIcon,
  DirectionsBus as DirectionsBusIcon,
  Movie as MovieIcon,
  LocalHospital as LocalHospitalIcon,
  ShoppingBag as ShoppingBagIcon,
  Build as BuildIcon,
  Home as HomeIcon,
  ListAlt as ListAltIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

const CATEGORIES = ['Housing', 'Food', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Health'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

// Sample transactions data
const sampleTransactions: Transaction[] = [
  // March 2024 Income
  { id: "1", amount: 3000.00, description: "Monthly Salary", category: "Income", date: "2024-03-01", type: "income" },
  { id: "2", amount: 500.00, description: "Freelance Work", category: "Income", date: "2024-03-15", type: "income" },
  { id: "3", amount: 200.00, description: "Investment Returns", category: "Income", date: "2024-03-20", type: "income" },
  
  // March 2024 Expenses
  { id: "4", amount: 1200.00, description: "Rent Payment", category: "Housing", date: "2024-03-01", type: "expense" },
  { id: "5", amount: 450.00, description: "Grocery Shopping", category: "Food", date: "2024-03-05", type: "expense" },
  { id: "6", amount: 200.00, description: "Dining Out", category: "Food", date: "2024-03-10", type: "expense" },
  { id: "7", amount: 150.00, description: "Utilities", category: "Utilities", date: "2024-03-08", type: "expense" },
  { id: "8", amount: 100.00, description: "Internet Bill", category: "Utilities", date: "2024-03-10", type: "expense" },
  { id: "9", amount: 300.00, description: "Shopping", category: "Shopping", date: "2024-03-12", type: "expense" },
  { id: "10", amount: 80.00, description: "Entertainment", category: "Entertainment", date: "2024-03-15", type: "expense" },
  { id: "11", amount: 50.00, description: "Transportation", category: "Transportation", date: "2024-03-18", type: "expense" },
  { id: "12", amount: 200.00, description: "Health Insurance", category: "Health", date: "2024-03-20", type: "expense" },
  
  // February 2024
  { id: "13", amount: 3000.00, description: "Monthly Salary", category: "Income", date: "2024-02-01", type: "income" },
  { id: "14", amount: 400.00, description: "Freelance Work", category: "Income", date: "2024-02-15", type: "income" },
  { id: "15", amount: 1200.00, description: "Rent Payment", category: "Housing", date: "2024-02-01", type: "expense" },
  { id: "16", amount: 400.00, description: "Grocery Shopping", category: "Food", date: "2024-02-05", type: "expense" },
  { id: "17", amount: 150.00, description: "Dining Out", category: "Food", date: "2024-02-10", type: "expense" },
  { id: "18", amount: 150.00, description: "Utilities", category: "Utilities", date: "2024-02-08", type: "expense" },
  { id: "19", amount: 100.00, description: "Internet Bill", category: "Utilities", date: "2024-02-10", type: "expense" },
  { id: "20", amount: 250.00, description: "Shopping", category: "Shopping", date: "2024-02-12", type: "expense" }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Housing':
      return <HomeIcon />;
    case 'Food':
      return <RestaurantIcon />;
    case 'Transportation':
      return <DirectionsBusIcon />;
    case 'Entertainment':
      return <MovieIcon />;
    case 'Health':
      return <LocalHospitalIcon />;
    case 'Shopping':
      return <ShoppingBagIcon />;
    case 'Utilities':
      return <BuildIcon />;
    default:
      return <CategoryIcon />;
  }
};

const Reports: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('3');
  const [transactions] = useState<Transaction[]>(sampleTransactions);

  // Calculate totals from transactions
  const totals = useMemo(() => {
    const totalIncome = transactions.reduce((sum, t) => 
      t.type === 'income' ? sum + t.amount : sum, 0
    );
    const totalExpenses = transactions.reduce((sum, t) => 
      t.type === 'expense' ? sum + t.amount : sum, 0
    );
    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = (totalSavings / totalIncome) * 100;

    return {
      income: totalIncome,
      expenses: totalExpenses,
      savings: totalSavings,
      savingsRate: savingsRate
    };
  }, [transactions]);

  const getFilteredTransactions = useMemo(() => {
    const months = parseInt(timeRange);
    const cutoffDate = subMonths(new Date(), months);
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= cutoffDate;
    });
  }, [timeRange, transactions]);

  const getMonthlyData = useMemo(() => {
    const monthlyData = getFilteredTransactions.reduce((acc, transaction) => {
      const month = format(new Date(transaction.date), 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = {
          income: 0,
          expenses: 0,
          categories: {} as Record<string, number>
        };
      }
      
      if (transaction.type === 'income') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expenses += transaction.amount;
        acc[month].categories[transaction.category] = 
          (acc[month].categories[transaction.category] || 0) + transaction.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number; categories: Record<string, number> }>);

    return Object.entries(monthlyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        savings: data.income - data.expenses,
        ...data.categories
      }));
  }, [getFilteredTransactions]);

  const getCategoryData = useMemo(() => {
    const categoryData = getFilteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = 0;
        }
        acc[transaction.category] += transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryData)
      .map(([category, amount]) => ({
        name: category,
        value: amount
      }))
      .sort((a, b) => b.value - a.value);
  }, [getFilteredTransactions]);

  const getSummaryData = useMemo(() => {
    const totalIncome = getFilteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = getFilteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      savings: totalIncome - totalExpenses,
      savingsRate
    };
  }, [getFilteredTransactions]);

  const renderSummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Income
            </Typography>
            <Typography variant="h4" color="primary">
              €{totals.income.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4" color="error">
              €{totals.expenses.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Savings
            </Typography>
            <Typography variant="h4" color="success.main">
              €{totals.savings.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Savings Rate
            </Typography>
            <Typography variant="h4" color="info.main">
              {totals.savingsRate.toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderMonthlyTrends = () => {
    const monthlyData = transactions.reduce((acc, transaction) => {
      const month = format(new Date(transaction.date), 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0, savings: 0 };
      }
      if (transaction.type === 'income') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expenses += transaction.amount;
      }
      acc[month].savings = acc[month].income - acc[month].expenses;
      return acc;
    }, {} as Record<string, { income: number; expenses: number; savings: number }>);

    const chartData = Object.entries(monthlyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([month, data]) => ({
        month,
        ...data
      }));

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Monthly Income vs Expenses
          </Typography>
          <Box height={400}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#4caf50"
                  name="Income"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f44336"
                  name="Expenses"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#2196f3"
                  name="Savings"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderTransactionList = () => {
    // Group transactions by month
    const groupedTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .reduce((acc, transaction) => {
        const monthYear = format(new Date(transaction.date), 'MMMM yyyy');
        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }
        acc[monthYear].push(transaction);
        return acc;
      }, {} as Record<string, Transaction[]>);

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Transaction History
          </Typography>
          {Object.entries(groupedTransactions).map(([monthYear, monthTransactions]) => (
            <Box key={monthYear} sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  backgroundColor: 'background.default',
                  p: 1,
                  borderRadius: 1,
                  mb: 2
                }}
              >
                {monthYear}
              </Typography>
              <List>
                {monthTransactions.map((transaction) => {
                  const transactionDate = new Date(transaction.date);
                  return (
                    <ListItem 
                      key={transaction.id} 
                      sx={{ 
                        borderBottom: '1px solid #eee',
                        py: 2
                      }}
                    >
                      <ListItemIcon>
                        {transaction.type === 'income' ? (
                          <TrendingUpIcon 
                            sx={{ 
                              color: 'success.main',
                              backgroundColor: 'success.light',
                              p: 1,
                              borderRadius: '50%'
                            }} 
                          />
                        ) : (
                          <Box
                            sx={{
                              backgroundColor: COLORS[CATEGORIES.indexOf(transaction.category) % COLORS.length],
                              p: 1,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {getCategoryIcon(transaction.category)}
                          </Box>
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {transaction.description}
                            </Typography>
                            <Typography 
                              variant="caption"
                              sx={{ 
                                backgroundColor: transaction.type === 'income' ? 'success.light' : 'error.light',
                                color: transaction.type === 'income' ? 'success.main' : 'error.main',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1
                              }}
                            >
                              {transaction.type.toUpperCase()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              <CalendarIcon sx={{ fontSize: 16 }} />
                              {format(transactionDate, 'MMM d, yyyy')}
                            </Typography>
                            {transaction.type === 'expense' && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: 0.5
                                }}
                              >
                                <CategoryIcon sx={{ fontSize: 16 }} />
                                {transaction.category}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Typography
                        variant="subtitle1"
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        fontWeight="medium"
                        sx={{ 
                          minWidth: 120,
                          textAlign: 'right'
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </Typography>
                    </ListItem>
                  );
                })}
                <ListItem sx={{ backgroundColor: 'background.default', py: 2 }}>
                  <ListItemText>
                    <Typography variant="subtitle2">
                      Monthly Summary
                    </Typography>
                  </ListItemText>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="success.main">
                      Income: {formatCurrency(
                        monthTransactions
                          .filter(t => t.type === 'income')
                          .reduce((sum, t) => sum + t.amount, 0)
                      )}
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      Expenses: {formatCurrency(
                        monthTransactions
                          .filter(t => t.type === 'expense')
                          .reduce((sum, t) => sum + t.amount, 0)
                      )}
                    </Typography>
                  </Box>
                </ListItem>
              </List>
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderCategoryBreakdown = () => {
    const categoryData = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = {
            total: 0,
            count: 0,
            transactions: []
          };
        }
        acc[transaction.category].total += transaction.amount;
        acc[transaction.category].count += 1;
        acc[transaction.category].transactions.push(transaction);
        return acc;
      }, {} as Record<string, { total: number; count: number; transactions: Transaction[] }>);

    const chartData = Object.entries(categoryData)
      .map(([category, data]) => ({
        name: category,
        value: data.total,
        count: data.count
      }))
      .sort((a, b) => b.value - a.value);

    const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense Categories
              </Typography>
              <Box height={400}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label={({ name, value, percent }) => 
                        `${name} (${formatCurrency(value)} - ${(percent * 100).toFixed(1)}%)`
                      }
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Details
              </Typography>
              <List>
                {chartData.map((category, index) => (
                  <ListItem key={category.name} sx={{ borderBottom: '1px solid #eee' }}>
                    <ListItemIcon>
                      {getCategoryIcon(category.name)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          {category.name}
                        </Typography>
                      }
                      secondary={`${category.count} transactions`}
                    />
                    <Box sx={{ minWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {((category.value / totalExpenses) * 100).toFixed(1)}% of total expenses
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(category.value / totalExpenses) * 100}
                        sx={{ 
                          height: 8, 
                          borderRadius: 5,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: COLORS[index % COLORS.length]
                          }
                        }}
                      />
                    </Box>
                    <Typography
                      variant="subtitle1"
                      color="error.main"
                      fontWeight="medium"
                      sx={{ ml: 2, minWidth: 100, textAlign: 'right' }}
                    >
                      {formatCurrency(category.value)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderCategoryTrends = () => {
    // Calculate monthly category totals from transactions
    const monthlyData = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const month = format(new Date(transaction.date), 'MMM yyyy');
        if (!acc[month]) {
          acc[month] = {};
          // Initialize all categories to 0
          CATEGORIES.forEach(cat => {
            acc[month][cat] = 0;
          });
        }
        // Add transaction amount to the correct category
        if (CATEGORIES.includes(transaction.category)) {
          acc[month][transaction.category] += transaction.amount;
        }
        return acc;
      }, {} as Record<string, Record<string, number>>);

    // Convert to array and sort by date
    const chartData = Object.entries(monthlyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([month, categories]) => ({
        month,
        ...categories
      }));

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Monthly Category Trends
          </Typography>
          <Box height={400}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `€${value}`} />
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                />
                <Legend />
                {CATEGORIES.map((category, index) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    fill={COLORS[index % COLORS.length]}
                    name={category}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Financial Reports
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="1">Last Month</MenuItem>
            <MenuItem value="3">Last 3 Months</MenuItem>
            <MenuItem value="6">Last 6 Months</MenuItem>
            <MenuItem value="12">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {renderSummaryCards()}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<TimelineIcon />} label="Trends" />
          <Tab icon={<PieChartIcon />} label="Categories" />
          <Tab icon={<ListAltIcon />} label="Details" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {renderMonthlyTrends()}
          </Grid>
          <Grid item xs={12}>
            {renderCategoryTrends()}
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            {renderCategoryBreakdown()}
          </Grid>
          <Grid item xs={12} md={5}>
            {renderTransactionList()}
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {renderTransactionList()}
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export default Reports; 
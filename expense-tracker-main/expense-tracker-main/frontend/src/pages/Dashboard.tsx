import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  ListItemIcon,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Chat as ChatIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
  SmartToy as SmartToyIcon,
  Restaurant as RestaurantIcon,
  DirectionsBus as DirectionsBusIcon,
  Movie as MovieIcon,
  LocalHospital as LocalHospitalIcon,
  ShoppingBag as ShoppingBagIcon,
  Build as BuildIcon,
  MoreHoriz as MoreHorizIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';

// Define interfaces for our data types
interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  is_ai_tagged?: boolean;
  ai_confidence?: number;
}

interface Budget {
  id: string;
  category: string;
  amount_limit: number;
  user_id: string;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'expense' | 'income';
}

interface FinancialInsight {
  title: string;
  description: string;
  type: 'warning' | 'success' | 'info';
  confidence: number;
}

interface AIInsight {
  topCategory: string;
  topCategoryAmount: number;
  averageDailySpend: number;
  insights: FinancialInsight[];
}

const CATEGORIES = ['Housing', 'Food', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Health'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const getCategoryIcon = (category: string) => {
  switch (category) {
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
      return <MoreHorizIcon />;
  }
};

const sampleTransactions = [
  // March 2024 Income
  {
    id: '1',
    amount: 3000,
    description: 'Monthly Salary',
    category: 'Income',
    date: '2024-03-01',
    type: 'income'
  },
  {
    id: '2',
    amount: 500,
    description: 'Freelance Work',
    category: 'Income',
    date: '2024-03-15',
    type: 'income'
  },
  {
    id: '3',
    amount: 200,
    description: 'Investment Returns',
    category: 'Income',
    date: '2024-03-20',
    type: 'income'
  },

  // March 2024 Expenses
  {
    id: '4',
    amount: 1200,
    description: 'Rent Payment',
    category: 'Housing',
    date: '2024-03-01',
    type: 'expense'
  },
  {
    id: '5',
    amount: 450,
    description: 'Grocery Shopping',
    category: 'Food',
    date: '2024-03-05',
    type: 'expense'
  },
  {
    id: '6',
    amount: 200,
    description: 'Dining Out',
    category: 'Food',
    date: '2024-03-10',
    type: 'expense'
  },
  {
    id: '7',
    amount: 150,
    description: 'Utilities',
    category: 'Utilities',
    date: '2024-03-15',
    type: 'expense'
  },
  {
    id: '8',
    amount: 100,
    description: 'Internet Bill',
    category: 'Utilities',
    date: '2024-03-15',
    type: 'expense'
  },
  {
    id: '9',
    amount: 300,
    description: 'Shopping',
    category: 'Shopping',
    date: '2024-03-12',
    type: 'expense'
  },
  {
    id: '10',
    amount: 80,
    description: 'Entertainment',
    category: 'Entertainment',
    date: '2024-03-15',
    type: 'expense'
  },
  {
    id: '11',
    amount: 50,
    description: 'Transportation',
    category: 'Transportation',
    date: '2024-03-18',
    type: 'expense'
  },
  {
    id: '12',
    amount: 200,
    description: 'Health Insurance',
    category: 'Health',
    date: '2024-03-20',
    type: 'expense'
  }
] as const;

const sampleBudgets: Budget[] = [
  { id: "1", category: "Housing", amount_limit: 1200.00, user_id: "1" },
  { id: "2", category: "Food", amount_limit: 800.00, user_id: "1" },
  { id: "3", category: "Utilities", amount_limit: 300.00, user_id: "1" },
  { id: "4", category: "Transportation", amount_limit: 200.00, user_id: "1" },
  { id: "5", category: "Entertainment", amount_limit: 300.00, user_id: "1" },
  { id: "6", category: "Shopping", amount_limit: 400.00, user_id: "1" },
  { id: "7", category: "Health", amount_limit: 300.00, user_id: "1" }
];

const sampleExpenses: Expense[] = [
  { id: "1", amount: 1200.00, description: "Rent Payment", category: "Housing", date: "2024-03-01" },
  { id: "2", amount: 450.00, description: "Grocery Shopping", category: "Food", date: "2024-03-05" },
  { id: "3", amount: 200.00, description: "Dining Out", category: "Food", date: "2024-03-10" },
  { id: "4", amount: 150.00, description: "Utilities", category: "Utilities", date: "2024-03-08" },
  { id: "5", amount: 100.00, description: "Internet Bill", category: "Utilities", date: "2024-03-10" },
  { id: "6", amount: 300.00, description: "Shopping", category: "Shopping", date: "2024-03-12" },
  { id: "7", amount: 80.00, description: "Entertainment", category: "Entertainment", date: "2024-03-15" },
  { id: "8", amount: 50.00, description: "Transportation", category: "Transportation", date: "2024-03-18" },
  { id: "9", amount: 200.00, description: "Health Insurance", category: "Health", date: "2024-03-20" }
];

const sampleInsights: FinancialInsight[] = [
  {
    title: "Spending Alert",
    description: "Your food expenses are 20% higher than last month.",
    type: "warning",
    confidence: 0.95
  },
  {
    title: "Savings Opportunity",
    description: "You could save €150 by reducing entertainment expenses.",
    type: "success",
    confidence: 0.90
  },
  {
    title: "Financial Health",
    description: "Your savings rate is 15% this month.",
    type: "info",
    confidence: 0.85
  },
  {
    title: "Budget Progress",
    description: "You've spent 65% of your monthly budget.",
    type: "info",
    confidence: 0.92
  },
  {
    title: "Income Growth",
    description: "Your income has increased by 10% this month.",
    type: "success",
    confidence: 0.88
  },
  {
    title: "Subscription Review",
    description: "Consider reviewing your monthly subscriptions.",
    type: "warning",
    confidence: 0.87
  }
];

const totalBudget = 3500; // Total monthly budget

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Direct calculations without state
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Filter current month's transactions
  const currentMonthTransactions = sampleTransactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === 2 && // March is month 2 (0-based)
           transactionDate.getFullYear() === 2024;
  });

  // Calculate totals
  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0); // Should be 3700

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0); // Should be 2730

  const monthlySavings = monthlyIncome - monthlyExpenses; // Should be 970
  const budgetLeft = totalBudget - monthlyExpenses; // Should be 770
  const savingsRate = (monthlySavings / monthlyIncome) * 100; // Should be 26.2%

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const renderMonthlyOverview = () => (
    <Grid container spacing={3} mb={4}>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Monthly Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Total Expenses
              </Typography>
              <Typography variant="h4">
                {formatCurrency(monthlyExpenses)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Budget Left
              </Typography>
              <Typography variant="h4" color={budgetLeft < 0 ? 'error' : 'inherit'}>
                {formatCurrency(budgetLeft)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/expenses')}
            fullWidth
            sx={{ mb: 2 }}
          >
            Add Expense
          </Button>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={() => navigate('/reports')}
            fullWidth
            sx={{ mb: 2 }}
          >
            View Reports
          </Button>
          <Button
            variant="contained"
            startIcon={<AccountBalanceIcon />}
            onClick={() => navigate('/budget')}
            fullWidth
            sx={{ mb: 2 }}
          >
            Manage Budgets
          </Button>
          <Button
            variant="contained"
            startIcon={<SmartToyIcon />}
            onClick={() => navigate('/chatbot')}
            fullWidth
            sx={{ mb: 2 }}
          >
            Ask AI Assistant
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );

  const getFinancialSummary = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const currentMonthTransactions = sampleTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const lastMonthTransactions = sampleTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === (currentMonth - 1) && 
             transactionDate.getFullYear() === currentYear;
    });

    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeChange = lastMonthIncome ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
    const expenseChange = lastMonthExpenses ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;
    
    const currentSavings = currentMonthIncome - currentMonthExpenses;
    const lastMonthSavings = lastMonthIncome - lastMonthExpenses;
    const savingsChange = lastMonthSavings ? ((currentSavings - lastMonthSavings) / lastMonthSavings) * 100 : 0;

    return {
      currentMonthIncome,
      currentMonthExpenses,
      currentSavings,
      incomeChange,
      expenseChange,
      savingsChange,
      savingsRate: currentMonthIncome ? (currentSavings / currentMonthIncome) * 100 : 0
    };
  }, []);

  const monthlyAnalysis = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentMonthTransactions = sampleTransactions.filter(transaction => {
      const transactionMonth = new Date(transaction.date).getMonth();
      return transactionMonth === currentMonth && transaction.type === 'expense';
    });

    const totalExpenses = currentMonthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const budgetLeft = totalBudget - totalExpenses;

    return {
      totalExpenses,
      budgetLeft
    };
  }, []);

  const renderFinancialOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Income
            </Typography>
            <Typography variant="h4" color="primary">
              {formatCurrency(monthlyIncome)}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUpIcon color="success" />
              <Typography variant="body2" color="text.secondary" ml={1}>
                +8.8% from last month
              </Typography>
            </Box>
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
              {formatCurrency(monthlyExpenses)}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUpIcon color="error" />
              <Typography variant="body2" color="text.secondary" ml={1}>
                +21.3% from last month
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Savings
            </Typography>
            <Typography variant="h4" color="success">
              {formatCurrency(monthlySavings)}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUpIcon color="success" />
              <Typography variant="body2" color="text.secondary" ml={1}>
                {savingsRate.toFixed(1)}% savings rate
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Net Worth
            </Typography>
            <Typography variant="h4" color="primary">
              {formatCurrency(monthlySavings)}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUpIcon color="success" />
              <Typography variant="body2" color="text.secondary" ml={1}>
                +8% from last month
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTransactionAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Income
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatCurrency(monthlyIncome)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Expenses
                </Typography>
                <Typography variant="h6" color="error.main">
                  {formatCurrency(monthlyExpenses)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Daily Average
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(monthlyExpenses / 30)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Top Category
                </Typography>
                <Typography variant="h6">
                  {sampleExpenses.slice(0, 10).map(e => e.category).join(', ')}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Category Breakdown
            </Typography>
            <List>
              {sampleExpenses.slice(0, 10).map((expense, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {getCategoryIcon(expense.category)}
                  </ListItemIcon>
                  <ListItemText
                    primary={expense.category}
                    secondary={`${formatCurrency(expense.amount)} (${((expense.amount / monthlyExpenses) * 100).toFixed(1)}%)`}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={(expense.amount / monthlyExpenses) * 100}
                    sx={{ width: '100px', mx: 2 }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSpendingTrends = () => {
    // Create sample data for February and March
    const trendData = [
      {
        month: 'Feb',
        income: 3400, // February income (3000 salary + 400 freelance)
        expenses: 2250, // February expenses
        savings: 1150 // February savings
      },
      {
        month: 'Mar',
        income: 3700, // March income (3000 salary + 500 freelance + 200 investment)
        expenses: 2730, // March expenses
        savings: 970 // March savings
      }
    ];

    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Monthly Trends
          </Typography>
          <Box height={300}>
            <ResponsiveContainer>
              <LineChart data={trendData}>
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

  const renderAIInsights = () => (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          AI Insights
        </Typography>
        <Grid container spacing={2}>
          {sampleInsights.map((insight, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  {insight.type === 'warning' && <WarningIcon color="warning" />}
                  {insight.type === 'success' && <TrendingUpIcon color="success" />}
                  {insight.type === 'info' && <InfoIcon color="info" />}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {insight.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {insight.description}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <LinearProgress
                    variant="determinate"
                    value={insight.confidence * 100}
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {(insight.confidence * 100).toFixed(0)}%
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Monthly Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Monthly Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Expenses
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(monthlyExpenses)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Budget Left
                </Typography>
                <Typography variant="h4" color={budgetLeft < 0 ? 'error' : 'inherit'}>
                  {formatCurrency(budgetLeft)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/expenses')}
              fullWidth
              sx={{ mb: 2 }}
            >
              Add Expense
            </Button>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={() => navigate('/reports')}
              fullWidth
              sx={{ mb: 2 }}
            >
              View Reports
            </Button>
            <Button
              variant="contained"
              startIcon={<AccountBalanceIcon />}
              onClick={() => navigate('/budget')}
              fullWidth
              sx={{ mb: 2 }}
            >
              Manage Budgets
            </Button>
            <Button
              variant="contained"
              startIcon={<SmartToyIcon />}
              onClick={() => navigate('/chatbot')}
              fullWidth
              sx={{ mb: 2 }}
            >
              Ask AI Assistant
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Financial Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Income
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(monthlyIncome)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon color="success" />
                <Typography variant="body2" color="text.secondary" ml={1}>
                  +8.8% from last month
                </Typography>
              </Box>
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
                {formatCurrency(monthlyExpenses)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon color="error" />
                <Typography variant="body2" color="text.secondary" ml={1}>
                  +21.3% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Savings
              </Typography>
              <Typography variant="h4" color="success">
                {formatCurrency(monthlySavings)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon color="success" />
                <Typography variant="body2" color="text.secondary" ml={1}>
                  {savingsRate.toFixed(1)}% savings rate
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Net Worth
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(monthlySavings)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon color="success" />
                <Typography variant="body2" color="text.secondary" ml={1}>
                  +8% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Summary */}
      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Income
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatCurrency(monthlyIncome)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Expenses
                </Typography>
                <Typography variant="h6" color="error.main">
                  {formatCurrency(monthlyExpenses)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Rest of the component */}
      <Box mt={4}>
        {renderSpendingTrends()}
      </Box>
      <Box mt={4}>
        {renderAIInsights()}
      </Box>
    </Container>
  );
};

export default Dashboard; 
import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { format } from 'date-fns';

interface Budget {
  id: string;
  category: string;
  amount_limit: number;
  user_id: string;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

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

const CATEGORIES = ['Housing', 'Food', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Health'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const BudgetManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [budgets, setBudgets] = useState<Budget[]>(sampleBudgets);
  const [expenses] = useState<Expense[]>(sampleExpenses);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    amount_limit: 0
  });

  const budgetAnalysis = useMemo(() => {
    const monthlyExpenses = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).getMonth();
      if (month === new Date().getMonth()) {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return budgets.map(budget => {
      const spent = monthlyExpenses[budget.category] || 0;
      const percentage = (spent / budget.amount_limit) * 100;
      const remaining = budget.amount_limit - spent;
      const status = percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good';

      return {
        ...budget,
        spent,
        percentage,
        remaining,
        status
      };
    });
  }, [budgets, expenses]);

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setSelectedBudget(budget);
      setFormData({
        category: budget.category,
        amount_limit: budget.amount_limit
      });
    } else {
      setSelectedBudget(null);
      setFormData({
        category: '',
        amount_limit: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBudget(null);
    setFormData({
      category: '',
      amount_limit: 0
    });
  };

  const handleSubmit = () => {
    if (selectedBudget) {
      setBudgets(budgets.map(b => 
        b.id === selectedBudget.id 
          ? { ...b, amount_limit: formData.amount_limit }
          : b
      ));
    } else {
      setBudgets([...budgets, {
        id: Date.now().toString(),
        category: formData.category,
        amount_limit: formData.amount_limit,
        user_id: "1"
      }]);
    }
    handleCloseDialog();
  };

  const renderBudgetList = () => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Budget Categories</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Budget
          </Button>
        </Box>
        <List>
          {budgetAnalysis.map((budget) => (
            <ListItem key={budget.id}>
              <ListItemIcon>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText
                primary={budget.category}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Spent: {formatCurrency(budget.spent)} / {formatCurrency(budget.amount_limit)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(budget.percentage, 100)}
                      color={budget.status === 'over' ? 'error' : budget.status === 'warning' ? 'warning' : 'success'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                }
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => handleOpenDialog(budget)}
              >
                Edit
              </Button>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderBudgetOverview = () => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount_limit, 0);
    const totalSpent = budgetAnalysis.reduce((sum, b) => sum + b.spent, 0);
    const percentage = (totalSpent / totalBudget) * 100;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h4">
                {formatCurrency(totalBudget)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h4" color={percentage > 100 ? 'error' : 'primary'}>
                {formatCurrency(totalSpent)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Remaining
              </Typography>
              <Typography variant="h4" color={totalBudget - totalSpent < 0 ? 'error' : 'success'}>
                {formatCurrency(totalBudget - totalSpent)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderCategoryDistribution = () => {
    const data = budgetAnalysis.map(budget => ({
      name: budget.category,
      value: budget.spent,
      limit: budget.amount_limit
    }));

    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Category Distribution
          </Typography>
          <Box height={300}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Budget Management
      </Typography>

      {renderBudgetOverview()}

      <Box mt={4}>
        {renderBudgetList()}
      </Box>

      <Box mt={4}>
        {renderCategoryDistribution()}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedBudget ? 'Edit Budget' : 'Add New Budget'}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            sx={{ mt: 2 }}
          >
            {CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Amount Limit"
            type="number"
            value={formData.amount_limit}
            onChange={(e) => setFormData({ ...formData, amount_limit: Number(e.target.value) })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedBudget ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export default BudgetManagement; 
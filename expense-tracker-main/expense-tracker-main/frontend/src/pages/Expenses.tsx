import React, { useState, useEffect, useMemo } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Container, 
    Alert,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress,
    LinearProgress,
    Chip,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
    Restaurant as RestaurantIcon,
    DirectionsBus as DirectionsBusIcon,
    Movie as MovieIcon,
    LocalHospital as LocalHospitalIcon,
    ShoppingBag as ShoppingBagIcon,
    Build as BuildIcon,
    MoreHoriz as MoreHorizIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Warning as WarningIcon,
    Category as CategoryIcon,
    CalendarToday as CalendarIcon,
    AttachMoney as MoneyIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

interface Expense {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
}

interface AIInsight {
    title: string;
    description: string;
    type: 'spending' | 'category' | 'prediction' | 'recommendation';
    confidence: number;
}

interface CategoryPercentage {
    category: string;
    amount: number;
    percentage: number;
}

const sampleExpenses: Expense[] = [
    { id: "1", amount: 15.99, description: "Lunch at Cafe", category: "Food", date: "2024-03-15" },
    { id: "2", amount: 45.00, description: "Monthly bus pass", category: "Transportation", date: "2024-03-14" },
    { id: "3", amount: 29.99, description: "Movie tickets", category: "Entertainment", date: "2024-03-13" },
    { id: "4", amount: 120.00, description: "Grocery shopping", category: "Food", date: "2024-03-12" },
    { id: "5", amount: 60.00, description: "Dinner with friends", category: "Food", date: "2024-03-11" },
    { id: "6", amount: 35.50, description: "Gas for car", category: "Transportation", date: "2024-03-10" },
    { id: "7", amount: 25.00, description: "Gym membership", category: "Health", date: "2024-03-09" },
    { id: "8", amount: 12.99, description: "Coffee and snacks", category: "Food", date: "2024-03-08" },
    { id: "9", amount: 80.00, description: "New shoes", category: "Shopping", date: "2024-03-07" },
    { id: "10", amount: 45.00, description: "Phone bill", category: "Utilities", date: "2024-03-06" }
];

const sampleInsights: AIInsight[] = [
    {
        title: "High Food Spending",
        description: "Your food expenses account for 40% of total spending this month.",
        type: "category",
        confidence: 0.95
    },
    {
        title: "Spending Trend",
        description: "Your daily spending has increased by €5.20 on average.",
        type: "spending",
        confidence: 0.85
    },
    {
        title: "Budget Alert",
        description: "Consider reducing food expenses as they exceed your budget by 15%.",
        type: "recommendation",
        confidence: 0.90
    },
    {
        title: "Future Prediction",
        description: "Based on current trends, you're likely to spend €1200 this month.",
        type: "prediction",
        confidence: 0.80
    }
];

const categories = [
    "Food",
    "Transportation",
    "Entertainment",
    "Health",
    "Shopping",
    "Utilities",
    "Other"
];

const CATEGORIES = ['Food', 'Transportation', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other'];
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

const Expenses: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [expenses, setExpenses] = useState<Expense[]>(sampleExpenses);
    const [aiInsights, setAiInsights] = useState<AIInsight[]>(sampleInsights);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCategoryChange = (e: any) => {
        setFormData(prev => ({
            ...prev,
            category: e.target.value
        }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            date: e.target.value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.amount || !formData.description || !formData.category) {
            // Handle validation
            return;
        }

        const expense: Expense = {
            id: (expenses.length + 1).toString(),
            amount: parseFloat(formData.amount),
            description: formData.description,
            category: formData.category,
            date: formData.date
        };

        setExpenses(prev => [...prev, expense]);
        setFormData({
            amount: '',
            description: '',
            category: '',
            date: format(new Date(), 'yyyy-MM-dd')
        });
        setOpenDialog(false);
    };

    const handleDeleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
    };

    const analytics = useMemo(() => {
        const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const categoryTotals = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {} as Record<string, number>);

        const categoryPercentages: CategoryPercentage[] = Object.entries(categoryTotals).map(([category, amount]) => ({
            category,
            amount,
            percentage: (amount / totalSpent) * 100
        }));

        return {
            totalSpent,
            categoryPercentages,
            topCategory: Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None',
            averageDaily: totalSpent / expenses.length || 0
        };
    }, [expenses]);

    const renderExpenseList = () => (
        <List>
            {expenses.map((expense) => (
                <Paper
                    key={expense.id}
                    elevation={2}
                    sx={{ mb: 2, borderRadius: 2 }}
                >
                    <ListItem>
                        <ListItemIcon>
                            {getCategoryIcon(expense.category)}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="subtitle1" component="span">
                                        {expense.description}
                                    </Typography>
                                    <Chip
                                        label={expense.category}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                            }
                            secondary={
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                                    </Typography>
                                    <Typography variant="body1" color="primary" fontWeight="bold">
                                        €{expense.amount.toFixed(2)}
                                    </Typography>
                                </Box>
                            }
                        />
                        <Box>
                            <Tooltip title="Edit">
                                <IconButton onClick={() => {
                                    setSelectedExpense(expense);
                                    setFormData({
                                        amount: expense.amount.toString(),
                                        description: expense.description,
                                        category: expense.category,
                                        date: expense.date
                                    });
                                    setOpenDialog(true);
                                }}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton onClick={() => handleDeleteExpense(expense.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </ListItem>
                </Paper>
            ))}
        </List>
    );

    const renderAnalytics = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Category Distribution
                        </Typography>
                        <Box height={300}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={analytics.categoryPercentages}
                                        dataKey="percentage"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {analytics.categoryPercentages.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <List>
                            {analytics.categoryPercentages.map((item) => (
                                <ListItem key={item.category}>
                                    <ListItemIcon>
                                        {getCategoryIcon(item.category)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.category}
                                        secondary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="body2" color="text.secondary">
                                                    €{item.amount.toFixed(2)}
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={item.percentage}
                                                    sx={{ flexGrow: 1 }}
                                                />
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.percentage.toFixed(1)}%
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Spending Trends
                        </Typography>
                        <Box height={300}>
                            <ResponsiveContainer>
                                <LineChart data={expenses.map(expense => ({
                                    date: format(new Date(expense.date), 'MMM dd'),
                                    amount: expense.amount
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        stroke={theme.palette.primary.main}
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            AI Insights
                        </Typography>
                        {isAnalyzing ? (
                            <Box display="flex" justifyContent="center" p={3}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {aiInsights.map((insight, index) => (
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
                                                {insight.type === 'spending' && <TrendingUpIcon color="primary" />}
                                                {insight.type === 'category' && <CategoryIcon color="secondary" />}
                                                {insight.type === 'prediction' && <CalendarIcon color="info" />}
                                                {insight.type === 'recommendation' && <WarningIcon color="warning" />}
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
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    return (
        <Container maxWidth="lg">
            <Box py={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" component="h1">
                        Expenses
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedExpense(null);
                            setFormData({
                                amount: '',
                                description: '',
                                category: '',
                                date: format(new Date(), 'yyyy-MM-dd')
                            });
                            setOpenDialog(true);
                        }}
                    >
                        Add Expense
                    </Button>
                </Box>

                {renderExpenseList()}

                <Box mt={4}>
                    {renderAnalytics()}
                </Box>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
                    </DialogTitle>
                    <form onSubmit={handleSubmit}>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        required
                                        InputProps={{
                                            startAdornment: <MoneyIcon color="action" sx={{ mr: 1 }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Category"
                                        value={formData.category}
                                        onChange={handleCategoryChange}
                                        required
                                    >
                                        {CATEGORIES.map((category) => (
                                            <MenuItem key={category} value={category}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {getCategoryIcon(category)}
                                                    {category}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Date"
                                        type="date"
                                        value={formData.date}
                                        onChange={handleDateChange}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button type="submit" variant="contained" color="primary">
                                {selectedExpense ? 'Update' : 'Add'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Box>
        </Container>
    );
};

export default Expenses; 
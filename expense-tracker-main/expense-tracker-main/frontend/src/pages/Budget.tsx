import React, { useState, useMemo, FC } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    LinearProgress,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    useMediaQuery,
    Alert,
    Tooltip,
    MenuItem
} from '@mui/material';
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
    Info as InfoIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PieChart, Pie, Cell, ResponsiveContainer as PieResponsiveContainer, Legend } from 'recharts';

interface Budget {
    id: string;
    category: string;
    amount: number;
    spent: number;
    period: 'monthly' | 'weekly' | 'yearly';
    startDate: string;
    endDate: string;
}

interface BudgetInsight {
    title: string;
    description: string;
    type: 'warning' | 'success' | 'info';
    confidence: number;
}

const CATEGORIES = ['Housing', 'Food', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Health'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const sampleBudgets: Budget[] = [
    {
        id: "1",
        category: "Housing",
        amount: 1200,
        spent: 1200,
        period: "monthly",
        startDate: "2024-03-01",
        endDate: "2024-03-31"
    },
    {
        id: "2",
        category: "Food",
        amount: 800,
        spent: 650,
        period: "monthly",
        startDate: "2024-03-01",
        endDate: "2024-03-31"
    },
    {
        id: "3",
        category: "Utilities",
        amount: 300,
        spent: 250,
        period: "monthly",
        startDate: "2024-03-01",
        endDate: "2024-03-31"
    },
    {
        id: "4",
        category: "Transportation",
        amount: 150,
        spent: 50,
        period: "monthly",
        startDate: "2024-03-01",
        endDate: "2024-03-31"
    },
    {
        id: "5",
        category: "Entertainment",
        amount: 200,
        spent: 80,
        period: "monthly",
        startDate: "2024-03-01",
        endDate: "2024-03-31"
    },
    {
        id: "6",
        category: "Shopping",
        amount: 400,
        spent: 300,
        period: "monthly",
        startDate: "2024-03-01",
        endDate: "2024-03-31"
    },
    {
        id: "7",
        category: "Health",
        amount: 250,
        spent: 200,
        period: "monthly",
        startDate: "2024-03-01",
        endDate: "2024-03-31"
    }
];

const sampleInsights: BudgetInsight[] = [
    {
        title: "Housing Budget Alert",
        description: "You've reached 100% of your Housing budget this month.",
        type: "warning",
        confidence: 0.95
    },
    {
        title: "Transportation Savings",
        description: "You're only using 33% of your Transportation budget - great savings!",
        type: "success",
        confidence: 0.90
    },
    {
        title: "Food Budget Status",
        description: "You've used 81% of your Food budget - watch your spending.",
        type: "info",
        confidence: 0.85
    }
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
            return <MoreHorizIcon />;
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const Budget: FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [budgets, setBudgets] = useState<Budget[]>(sampleBudgets);
    const [insights, setInsights] = useState<BudgetInsight[]>(sampleInsights);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        period: 'monthly',
        startDate: '',
        endDate: ''
    });

    const analytics = useMemo(() => {
        const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
        const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
        const remaining = totalBudget - totalSpent;
        const percentageSpent = (totalSpent / totalBudget) * 100;

        return {
            totalBudget,
            totalSpent,
            remaining,
            percentageSpent,
            categoryBreakdown: budgets.map(budget => ({
                category: budget.category,
                budget: budget.amount,
                spent: budget.spent,
                remaining: budget.amount - budget.spent,
                percentage: (budget.spent / budget.amount) * 100
            }))
        };
    }, [budgets]);

    const renderBudgetList = () => (
        <List>
            {budgets.map((budget) => (
                <Paper
                    key={budget.id}
                    elevation={2}
                    sx={{ mb: 2, borderRadius: 2 }}
                >
                    <ListItem>
                        <ListItemIcon>
                            {getCategoryIcon(budget.category)}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="subtitle1" component="span">
                                        {budget.category}
                                    </Typography>
                                    <Chip
                                        label={budget.period}
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                    />
                                </Box>
                            }
                            secondary={
                                <Box display="flex" flexDirection="column" gap={1}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            Budget: €{budget.amount.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Spent: €{budget.spent.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Remaining: €{(budget.amount - budget.spent).toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(budget.spent / budget.amount) * 100}
                                        color={budget.spent > budget.amount ? "error" : "primary"}
                                    />
                                </Box>
                            }
                        />
                        <Box>
                            <Tooltip title="Edit">
                                <IconButton onClick={() => handleEditBudget(budget)}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton onClick={() => handleDeleteBudget(budget.id)}>
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
                            Budget Overview
                        </Typography>
                        <Box height={300}>
                            <ResponsiveContainer>
                                <BarChart data={analytics.categoryBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Bar dataKey="budget" fill={theme.palette.primary.main} />
                                    <Bar dataKey="spent" fill={theme.palette.secondary.main} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
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
                                <LineChart data={analytics.categoryBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="percentage"
                                        stroke={theme.palette.warning.main}
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
                        <Grid container spacing={2}>
                            {insights.map((insight, index) => (
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
            </Grid>
        </Grid>
    );

    const handleEditBudget = (budget: Budget) => {
        setSelectedBudget(budget);
        setFormData({
            category: budget.category,
            amount: budget.amount.toString(),
            period: budget.period,
            startDate: budget.startDate,
            endDate: budget.endDate
        });
        setOpenDialog(true);
    };

    const handleDeleteBudget = (id: string) => {
        setBudgets(prev => prev.filter(budget => budget.id !== id));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.category || !formData.amount) {
            return;
        }

        const budget: Budget = {
            id: selectedBudget?.id || (budgets.length + 1).toString(),
            category: formData.category,
            amount: parseFloat(formData.amount),
            spent: selectedBudget?.spent || 0,
            period: formData.period as 'monthly' | 'weekly' | 'yearly',
            startDate: formData.startDate,
            endDate: formData.endDate
        };

        if (selectedBudget) {
            setBudgets(prev => prev.map(b => b.id === budget.id ? budget : b));
        } else {
            setBudgets(prev => [...prev, budget]);
        }

        setFormData({
            category: '',
            amount: '',
            period: 'monthly',
            startDate: '',
            endDate: ''
        });
        setOpenDialog(false);
        setSelectedBudget(null);
    };

    const renderCategoryDistribution = () => {
        const totalBudget = budgets.reduce((sum, item) => sum + item.amount, 0);
        const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);

        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Category Distribution
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box height={300}>
                                <PieResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={budgets}
                                            dataKey="amount"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, value, percent }) => 
                                                `${name} (${formatCurrency(value)} - ${(percent * 100).toFixed(1)}%)`
                                            }
                                        >
                                            {budgets.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </PieResponsiveContainer>
                            </Box>
                            <Typography variant="subtitle1" align="center" gutterBottom>
                                Budget Allocation
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box height={300}>
                                <PieResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={budgets}
                                            dataKey="spent"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, value, percent }) => 
                                                `${name} (${formatCurrency(value)} - ${(percent * 100).toFixed(1)}%)`
                                            }
                                        >
                                            {budgets.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </PieResponsiveContainer>
                            </Box>
                            <Typography variant="subtitle1" align="center" gutterBottom>
                                Actual Spending
                            </Typography>
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 4 }}>
                        <List>
                            {budgets.map((category, index) => {
                                const percentSpent = (category.spent / category.amount) * 100;
                                return (
                                    <ListItem key={category.category} sx={{ borderBottom: '1px solid #eee' }}>
                                        <ListItemIcon>
                                            <Box
                                                sx={{
                                                    backgroundColor: COLORS[index % COLORS.length],
                                                    p: 1,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {getCategoryIcon(category.category)}
                                            </Box>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="medium">
                                                    {category.category}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Budget: {formatCurrency(category.amount)}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Spent: {formatCurrency(category.spent)}
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={percentSpent}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 5,
                                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: percentSpent > 90 ? 'error.main' : 
                                                                       percentSpent > 75 ? 'warning.main' : 
                                                                       'success.main'
                                                            }
                                                        }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                        {percentSpent.toFixed(1)}% of budget used
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                    <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Total Budget
                                </Typography>
                                <Typography variant="h6" color="primary">
                                    {formatCurrency(totalBudget)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Total Spent
                                </Typography>
                                <Typography variant="h6" color="error">
                                    {formatCurrency(totalSpent)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Container maxWidth="lg">
            <Box py={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" component="h1">
                        Budget
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedBudget(null);
                            setFormData({
                                category: '',
                                amount: '',
                                period: 'monthly',
                                startDate: '',
                                endDate: ''
                            });
                            setOpenDialog(true);
                        }}
                    >
                        Add Budget
                    </Button>
                </Box>

                {renderBudgetList()}

                <Box mt={4}>
                    {renderAnalytics()}
                </Box>

                <Box mt={4}>
                    {renderCategoryDistribution()}
                </Box>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {selectedBudget ? 'Edit Budget' : 'Add New Budget'}
                    </DialogTitle>
                    <form onSubmit={handleSubmit}>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
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
                                        label="Amount"
                                        name="amount"
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
                                        select
                                        label="Period"
                                        name="period"
                                        value={formData.period}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <MenuItem value="monthly">Monthly</MenuItem>
                                        <MenuItem value="weekly">Weekly</MenuItem>
                                        <MenuItem value="yearly">Yearly</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Start Date"
                                        name="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="End Date"
                                        name="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button type="submit" variant="contained" color="primary">
                                {selectedBudget ? 'Update' : 'Add'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Box>
        </Container>
    );
};

export default Budget; 
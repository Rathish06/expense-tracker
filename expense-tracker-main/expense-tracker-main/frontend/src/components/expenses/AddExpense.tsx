import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Paper,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';

interface ExpenseFormData {
    description: string;
    amount: number;
    date: string;
    category: string;
}

const categories = [
    'Food',
    'Transportation',
    'Entertainment',
    'Utilities',
    'Shopping',
    'Healthcare'
];

const AddExpense: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ExpenseFormData>({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to add expenses');
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    user_id: user.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add expense');
            }

            navigate('/dashboard');
        } catch (err) {
            console.error('Error adding expense:', err);
            setError(err instanceof Error ? err.message : 'Failed to add expense');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxWidth="sm" mx="auto" mt={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Add New Expense
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="Amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        margin="normal"
                        inputProps={{ min: 0, step: 0.01 }}
                    />

                    <TextField
                        fullWidth
                        label="Date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        fullWidth
                        select
                        label="Category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        margin="normal"
                    >
                        {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                                {category}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Box mt={3}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Add Expense'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default AddExpense; 
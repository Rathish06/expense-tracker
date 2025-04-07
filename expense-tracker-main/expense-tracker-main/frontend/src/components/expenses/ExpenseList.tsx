import React, { useState } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface Expense {
    id: number;
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

const ExpenseList: React.FC<{ expenses: Expense[]; onExpenseDeleted: () => void }> = ({ expenses, onExpenseDeleted }) => {
    const { user } = useAuth();
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<Expense | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleDelete = async (expenseId: number) => {
        if (!user) {
            setError('You must be logged in to delete expenses');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/expenses/${expenseId}?user_id=${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete expense');
            }

            onExpenseDeleted();
        } catch (err) {
            console.error('Error deleting expense:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete expense');
        }
    };

    const handleEdit = (expense: Expense) => {
        setSelectedExpense(expense);
        setEditFormData(expense);
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editFormData || !user) {
            setError('You must be logged in to edit expenses');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5000/api/expenses/${editFormData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...editFormData,
                    user_id: user.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update expense');
            }

            setIsEditDialogOpen(false);
            onExpenseDeleted();
        } catch (err) {
            console.error('Error updating expense:', err);
            setError(err instanceof Error ? err.message : 'Failed to update expense');
        } finally {
            setLoading(false);
        }
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editFormData) return;

        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        });
    };

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <List>
                {expenses.map((expense) => (
                    <ListItem
                        key={expense.id}
                        secondaryAction={
                            <Box>
                                <IconButton edge="end" onClick={() => handleEdit(expense)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" onClick={() => handleDelete(expense.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        }
                    >
                        <ListItemText
                            primary={
                                <Typography variant="subtitle1">
                                    {expense.description} - ${expense.amount.toFixed(2)}
                                </Typography>
                            }
                            secondary={
                                <Typography variant="body2" color="text.secondary">
                                    {formatDate(expense.date)} - {expense.category}
                                </Typography>
                            }
                        />
                    </ListItem>
                ))}
            </List>

            <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
                <DialogTitle>Edit Expense</DialogTitle>
                <form onSubmit={handleEditSubmit}>
                    <DialogContent>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={editFormData?.description || ''}
                            onChange={handleEditFormChange}
                            required
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            label="Amount"
                            name="amount"
                            type="number"
                            value={editFormData?.amount || ''}
                            onChange={handleEditFormChange}
                            required
                            margin="normal"
                            inputProps={{ min: 0, step: 0.01 }}
                        />

                        <TextField
                            fullWidth
                            label="Date"
                            name="date"
                            type="date"
                            value={editFormData?.date || ''}
                            onChange={handleEditFormChange}
                            required
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            fullWidth
                            select
                            label="Category"
                            name="category"
                            value={editFormData?.category || ''}
                            onChange={handleEditFormChange}
                            required
                            margin="normal"
                        >
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </TextField>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default ExpenseList; 
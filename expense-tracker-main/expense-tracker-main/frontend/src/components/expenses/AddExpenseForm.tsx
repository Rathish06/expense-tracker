import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem } from '@mui/material';
import CustomGrid from '../common/CustomGrid';

interface AddExpenseFormProps {
    onSubmit: (expenseData: any) => void;
    onCancel: () => void;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            amount: parseFloat(formData.amount)
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <CustomGrid container spacing={2}>
                <CustomGrid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="Amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        inputProps={{ step: "0.01" }}
                    />
                </CustomGrid>
                <CustomGrid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="Category"
                        name="category"
                        select
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <MenuItem value="food">Food</MenuItem>
                        <MenuItem value="transport">Transport</MenuItem>
                        <MenuItem value="utilities">Utilities</MenuItem>
                        <MenuItem value="entertainment">Entertainment</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                    </TextField>
                </CustomGrid>
                <CustomGrid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </CustomGrid>
                <CustomGrid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        label="Date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </CustomGrid>
                <CustomGrid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button onClick={onCancel} variant="outlined">
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            Add Expense
                        </Button>
                    </Box>
                </CustomGrid>
            </CustomGrid>
        </Box>
    );
};

export default AddExpenseForm; 
import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  SelectChangeEvent,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface ExpenseFormData {
  amount: string;
  description: string;
  category: string;
  date: string;
}

const CATEGORIES = [
  'Food',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Healthcare',
  'Health',
  'Education',
  'Other'
];

const AddExpense = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string;
    confidence: number;
  } | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const getAiSuggestion = async (description: string) => {
    if (description.length < 3) return;

    try {
      const response = await fetch('http://localhost:5000/api/ai/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestion(data);
        // Auto-set category if none is selected
        if (!formData.category) {
          setFormData(prev => ({
            ...prev,
            category: data.category
          }));
        }
      }
    } catch (err) {
      console.error('Error getting AI suggestion:', err);
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');

    // Get AI suggestion when description changes
    if (name === 'description' && value.length >= 3) {
      getAiSuggestion(value);
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear any previous errors
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }
    if (!formData.date) {
      setError('Date is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error('You must be logged in to add expenses');
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        throw new Error('Invalid amount value');
      }

      const expenseData = {
        user_id: user.id,
        amount,
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        currency: 'EUR'
      };

      console.log('Submitting expense:', expenseData);

      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add expense');
      }

      // Navigate back to dashboard
      navigate('/');
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Add New Expense
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleTextChange}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleTextChange}
              disabled={loading}
              helperText="Enter a description to get AI category suggestion"
            />

            {aiSuggestion && (
              <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                AI suggests category: {aiSuggestion.category} 
                (Confidence: {Math.round(aiSuggestion.confidence * 100)}%)
              </Alert>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleSelectChange}
                disabled={loading}
                required
              >
                {CATEGORIES.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleTextChange}
              disabled={loading}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="button"
                fullWidth
                variant="outlined"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Add Expense'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddExpense; 
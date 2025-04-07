import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExpenseData {
    date: string;
    amount: number;
    category: string;
}

const Analytics: React.FC = () => {
    const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenseData();
    }, []);

    const fetchExpenseData = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/expenses/analytics');
            const data = await response.json();
            setExpenseData(data);
        } catch (error) {
            console.error('Error fetching expense data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Expense Analytics
                </Typography>

                {loading ? (
                    <Typography>Loading analytics...</Typography>
                ) : (
                    <Box sx={{ width: '100%' }}>
                        <Paper sx={{ p: 2, height: 400 }}>
                            <Typography variant="h6" gutterBottom>
                                Expense Trends
                            </Typography>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={expenseData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#8884d8"
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Analytics; 
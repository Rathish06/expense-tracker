import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const Budgets = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Budget Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Coming soon! Set and manage your budgets by category to better control your spending.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Budgets; 
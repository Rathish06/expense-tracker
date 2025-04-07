import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const Settings = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Coming soon! Manage your account settings and preferences.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings; 
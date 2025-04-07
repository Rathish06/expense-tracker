import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const auth = useAuth();

    const handleLogout = () => {
        if (auth && typeof auth.logout === 'function') {
            auth.logout();
            navigate('/login');
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Expense Tracker
                </Typography>
                <Box>
                    <Button color="inherit" component={Link} to="/dashboard">
                        Dashboard
                    </Button>
                    <Button color="inherit" component={Link} to="/expenses">
                        Expenses
                    </Button>
                    <Button color="inherit" component={Link} to="/categories">
                        Categories
                    </Button>
                    <Button color="inherit" component={Link} to="/analytics">
                        Analytics
                    </Button>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 
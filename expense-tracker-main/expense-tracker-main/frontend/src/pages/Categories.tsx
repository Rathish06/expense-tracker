import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Card, CardContent } from '@mui/material';

interface Category {
    id: number;
    name: string;
    description: string;
}

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/categories/');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Categories
                    </Typography>
                    <Button variant="contained" color="primary">
                        Add Category
                    </Button>
                </Box>

                {loading ? (
                    <Typography>Loading categories...</Typography>
                ) : (
                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 3 
                    }}>
                        {categories.map((category) => (
                            <Box 
                                key={category.id} 
                                sx={{ 
                                    flex: '1 1 300px',
                                    maxWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }
                                }}
                            >
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" component="h2">
                                            {category.name}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            {category.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Categories; 
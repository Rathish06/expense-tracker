import React, { useState, useRef, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Divider,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Grid,
    LinearProgress
} from '@mui/material';
import {
    Send as SendIcon,
    SmartToy as SmartToyIcon,
    Person as PersonIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Warning as WarningIcon,
    Category as CategoryIcon,
    CalendarToday as CalendarIcon,
    AttachMoney as MoneyIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    type?: 'insight' | 'warning' | 'suggestion';
}

interface ChatInsight {
    title: string;
    description: string;
    type: 'warning' | 'success' | 'info';
    confidence: number;
}

const sampleMessages: Message[] = [
    {
        id: "1",
        text: "Hi! I'm your AI financial assistant. How can I help you today?",
        sender: "ai",
        timestamp: new Date("2024-03-15T10:00:00")
    },
    {
        id: "2",
        text: "Can you tell me about my spending patterns?",
        sender: "user",
        timestamp: new Date("2024-03-15T10:01:00")
    },
    {
        id: "3",
        text: "Based on your recent transactions, I've noticed that your food expenses are 20% higher than last month. Would you like me to provide more detailed insights?",
        sender: "ai",
        timestamp: new Date("2024-03-15T10:01:30"),
        type: "insight"
    },
    {
        id: "4",
        text: "Yes, please!",
        sender: "user",
        timestamp: new Date("2024-03-15T10:02:00")
    },
    {
        id: "5",
        text: "Here's a detailed analysis of your spending:\n\n1. Food: €450 (30% of total)\n2. Transportation: €180 (12%)\n3. Entertainment: €350 (23%)\n4. Shopping: €380 (25%)\n5. Utilities: €230 (15%)\n\nI notice that your entertainment expenses are above your budget. Would you like some suggestions to optimize your spending?",
        sender: "ai",
        timestamp: new Date("2024-03-15T10:02:30"),
        type: "insight"
    }
];

const sampleInsights: ChatInsight[] = [
    {
        title: "Spending Alert",
        description: "Your entertainment expenses are 16.7% over budget this month.",
        type: "warning",
        confidence: 0.95
    },
    {
        title: "Savings Opportunity",
        description: "You could save €150 by reducing entertainment expenses.",
        type: "success",
        confidence: 0.90
    },
    {
        title: "Budget Trend",
        description: "Your overall spending is 5% below budget this month.",
        type: "info",
        confidence: 0.85
    }
];

const AIChat: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [messages, setMessages] = useState<Message[]>(sampleMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: newMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm analyzing your request. Here are some insights based on your recent spending patterns...",
                sender: 'ai',
                timestamp: new Date(),
                type: 'insight'
            };

            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const renderMessage = (message: Message) => {
        const isAI = message.sender === 'ai';
        const avatar = isAI ? <SmartToyIcon /> : <PersonIcon />;
        const bgColor = isAI ? theme.palette.primary.light : theme.palette.grey[100];
        const textColor = isAI ? theme.palette.primary.contrastText : theme.palette.text.primary;

        return (
            <ListItem
                key={message.id}
                sx={{
                    flexDirection: isAI ? 'row' : 'row-reverse',
                    alignItems: 'flex-start',
                    mb: 2
                }}
            >
                <ListItemAvatar>
                    <Avatar sx={{ bgcolor: isAI ? theme.palette.primary.main : theme.palette.grey[500] }}>
                        {avatar}
                    </Avatar>
                </ListItemAvatar>
                <Paper
                    elevation={1}
                    sx={{
                        p: 2,
                        maxWidth: '70%',
                        bgcolor: bgColor,
                        color: textColor,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {message.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {format(message.timestamp, 'HH:mm')}
                    </Typography>
                </Paper>
            </ListItem>
        );
    };

    const renderInsights = () => (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                AI Insights
            </Typography>
            <Grid container spacing={2}>
                {sampleInsights.map((insight, index) => (
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
        </Box>
    );

    return (
        <Container maxWidth="lg">
            <Box py={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    AI Chat Assistant
                </Typography>

                <Paper
                    elevation={3}
                    sx={{
                        height: isMobile ? '60vh' : '70vh',
                        display: 'flex',
                        flexDirection: 'column',
                        mb: 3
                    }}
                >
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflow: 'auto',
                            p: 2
                        }}
                    >
                        <List>
                            {messages.map(renderMessage)}
                            {isTyping && (
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                            <SmartToyIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <CircularProgress size={24} />
                                </ListItem>
                            )}
                            <div ref={messagesEndRef} />
                        </List>
                    </Box>

                    <Divider />

                    <Box
                        sx={{
                            p: 2,
                            display: 'flex',
                            gap: 1
                        }}
                    >
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            multiline
                            maxRows={4}
                        />
                        <IconButton
                            color="primary"
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || isTyping}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Paper>

                {renderInsights()}
            </Box>
        </Container>
    );
};

export default AIChat; 
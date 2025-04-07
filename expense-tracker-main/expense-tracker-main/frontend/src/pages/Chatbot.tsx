import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  text: string | JSX.Element;
  isUser: boolean;
  response?: {
    amount: number;
    period: number;
    category: string;
    count: number;
    message: string;
    insights?: {
      anomalies: Array<{
        id: string;
        amount: number;
        description: string;
        category: string;
        date: string;
        anomaly_score: number;
      }>;
      patterns: {
        [key: string]: {
          average_amount: number;
          common_categories: { [key: string]: number };
          time_pattern: {
            hourly_distribution: { [key: string]: number };
            weekly_distribution: { [key: string]: number };
            monthly_distribution: { [key: string]: number };
          };
          size: number;
        };
      };
    };
  };
}

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "Hi! I can help you analyze your expenses. Try asking questions like:",
      isUser: false
    },
    {
      text: "• How much did I spend on food last month?",
      isUser: false
    },
    {
      text: "• What were my total expenses this year?",
      isUser: false
    },
    {
      text: "• Show me my transportation costs for the week",
      isUser: false
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!input.trim() || !user?.id) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    setLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          user_id: user.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process query');
      }

      // Add AI response to chat
      setMessages(prev => [
        ...prev,
        {
          text: formatResponse(data),
          isUser: false,
          response: data
        }
      ]);
    } catch (err) {
      console.error('Error processing chat query:', err);
      setError(err instanceof Error ? err.message : 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (data: ChatMessage['response']) => {
    if (!data) return 'I could not process your query.';

    let responseText = data.message;

    if (data.insights) {
      if (data.insights.anomalies.length > 0) {
        responseText += '\nUnusual Transactions:\n';
        data.insights.anomalies.forEach(anomaly => {
          responseText += `- ${anomaly.description} (${anomaly.category}) on ${new Date(anomaly.date).toLocaleDateString()} for ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(anomaly.amount)}\n`;
        });
      }

      if (Object.entries(data.insights.patterns).length > 0) {
        responseText += '\nSpending Patterns:\n';
        Object.entries(data.insights.patterns).forEach(([key, pattern]) => {
          responseText += `Pattern: ${Object.keys(pattern.common_categories).join(', ')}\n`;
          responseText += `Average: ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(pattern.average_amount)} • ${pattern.size} transactions\n`;
        });
      }
    }

    return responseText;
  };

  const getPeriodText = (period: number) => {
    switch (period) {
      case 0:
        return 'this month';
      case 1:
        return 'today';
      case 7:
        return 'this week';
      case 30:
        return 'last month';
      case 365:
        return 'this year';
      default:
        return `the last ${period} days`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            AI Expense Assistant
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ height: '400px', overflow: 'auto', mb: 2 }}>
            <List>
              {messages.map((message, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{
                    justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        bgcolor: message.isUser ? 'primary.main' : 'grey.100',
                        color: message.isUser ? 'white' : 'text.primary'
                      }}
                    >
                      <ListItemText primary={message.text} />
                    </Paper>
                  </ListItem>
                  {index < messages.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Ask about your expenses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              multiline
              maxRows={4}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              sx={{ minWidth: '100px' }}
            >
              {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Chatbot; 
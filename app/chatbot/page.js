'use client'
import { Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'

export default function Home() {
    const [messages, setMessages] = useState([
        {
          role: 'assistant',
          content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
        },
    ])
    const [message, setMessage] = useState('')

    const sendMessage = async () => {
      if (message.trim() === '') return;
 
      const userMessage = { role: 'user', content: message };
      const placeholderMessage = { role: 'assistant', content: '...' };
 
      setMessages((prevMessages) => [
          ...prevMessages,
          userMessage,
          placeholderMessage,
      ]);
      setMessage('');
 
      try {
          const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  message: message,
                  previousMessages: [...messages, userMessage],
              }),
          });
 
          if (!response.ok) {
              console.error('Response status:', response.status);
              console.error('Response text:', await response.text());
              throw new Error(`Failed to send message: ${response.statusText}`);
          }
 
          const result = await response.json();
          console.log('API Response:', result);
 
          if (!result.reply) {
              console.error('Invalid or missing reply from server:', result);
              throw new Error('Invalid reply from server');
          }
 
          setMessages((prevMessages) => [
              ...prevMessages.slice(0, -1),
              { role: 'assistant', content: result.reply },
          ]);
 
      } catch (error) {
          console.error('Error sending message:', error);
          setMessages((prevMessages) => [
              ...prevMessages.slice(0, -1),
              { role: 'assistant', content: 'Sorry, something went wrong.' },
          ]);
      }
  }
 

    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <Stack
                direction={'column'}
                width="500px"
                height="700px"
                border="1px solid black"
                p={2}
                spacing={3}
            >
                <Stack
                    direction={'column'}
                    spacing={2}
                    flexGrow={1}
                    overflow="auto"
                    maxHeight="100%"
                >
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            display="flex"
                            justifyContent={
                                message.role === 'assistant' ? 'flex-start' : 'flex-end'
                            }
                        >
                            <Box
                                bgcolor={
                                    message.role === 'assistant'
                                        ? 'primary.main'
                                        : 'secondary.main'
                                }
                                color="white"
                                borderRadius={16}
                                p={3}
                            >
                                {message.content}
                            </Box>
                        </Box>
                    ))}
                </Stack>
                <Stack direction={'row'} spacing={2}>
                    <TextField
                        label="Message"
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button variant="contained" onClick={sendMessage}>
                        Send
                    </Button>
                </Stack>
            </Stack>
        </Box>
    )
}

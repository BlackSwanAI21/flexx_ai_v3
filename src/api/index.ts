import express from 'express';
import { handleWebhook } from './webhook';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Webhook endpoint
app.post('/api/webhook', handleWebhook);

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
import { Handler } from '@netlify/functions';

// In-memory storage for webhook logs (this will reset when the function cold starts)
let webhookLogs: Array<{ timestamp: string; payload: any }> = [];

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'POST') {
    // Store new webhook log
    const payload = JSON.parse(event.body || '{}');
    webhookLogs.unshift({
      timestamp: new Date().toISOString(),
      payload
    });

    // Keep only the last 100 logs
    webhookLogs = webhookLogs.slice(0, 100);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookLogs)
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
import { Handler } from '@netlify/functions';
import { db_operations } from '../../src/lib/db';
import { createThread, sendMessage } from '../../src/lib/openai';

interface WebhookPayload {
  'Lead Response': string;
  'app email': string;
  'Active Assistant ID': string;
  'Assistant Memory Id'?: string;
}

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}') as WebhookPayload;

    // Log the webhook request
    await fetch('/.netlify/functions/webhook-logs', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    // Validate required fields
    if (!payload['Lead Response'] || !payload['app email'] || !payload['Active Assistant ID']) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Find user by email
    const user = await db_operations.findUserByEmail(payload['app email']);
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Get or create thread ID
    const threadId = payload['Assistant Memory Id'] || await createThread(user.id);

    // Find agent by assistant ID
    const agents = await db_operations.getAgentsByUser(user.id);
    const agent = agents.find(a => {
      const config = JSON.parse(a.config);
      return config.assistantId === payload['Active Assistant ID'];
    });

    if (!agent) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Agent not found' })
      };
    }

    // Create or get chat session
    let chat;
    if (!payload['Assistant Memory Id']) {
      // Create new chat session
      chat = await db_operations.createChat({
        agentId: agent.id,
        userId: user.id,
        threadId,
        source: 'webhook',
        metadata: JSON.stringify(payload)
      });
    } else {
      // Find existing chat session
      const chats = await db_operations.getChatsByAgent(agent.id);
      chat = chats.find(c => c.threadId === threadId);
      if (!chat) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Chat session not found' })
        };
      }
    }

    // Save user message
    await db_operations.addMessage({
      chatId: chat.id,
      role: 'user',
      content: payload['Lead Response']
    });

    // Get AI response
    const response = await sendMessage(
      user.id,
      threadId,
      payload['Active Assistant ID'],
      payload['Lead Response']
    );

    // Save AI response
    await db_operations.addMessage({
      chatId: chat.id,
      role: 'assistant',
      content: response
    });

    // Return response with thread ID
    return {
      statusCode: 200,
      body: JSON.stringify({
        response,
        threadId
      })
    };

  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
import { Request, Response } from 'express';
import { db_operations } from '../lib/db';
import { createThread, sendMessage } from '../lib/openai';

interface WebhookPayload {
  'Lead Response': string;
  'app email': string;
  'Active Assistant ID': string;
  'Assistant Memory Id'?: string;
}

export async function handleWebhook(req: Request, res: Response) {
  try {
    const payload = req.body as WebhookPayload;

    // Validate required fields
    if (!payload['Lead Response'] || !payload['app email'] || !payload['Active Assistant ID']) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find user by email
    const user = await db_operations.findUserByEmail(payload['app email']);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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
      return res.status(404).json({ error: 'Agent not found' });
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
        return res.status(404).json({ error: 'Chat session not found' });
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
    return res.json({
      response,
      threadId
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
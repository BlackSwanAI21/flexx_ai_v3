import { db_operations } from './db';
import { createThread, sendMessage } from './openai';

export interface WebhookPayload {
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: string;
  field5?: string;
}

export async function handleWebhookRequest(
  webhookSecret: string,
  payload: WebhookPayload
) {
  // Find the agent by webhook secret
  const agent = await db_operations.findAgentByWebhookSecret(webhookSecret);
  if (!agent) {
    throw new Error('Invalid webhook secret');
  }

  // Create a message from the webhook fields
  const message = Object.entries(payload)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  // Create a new thread
  const threadId = await createThread(agent.userId);

  // Create a new chat session
  const chat = await db_operations.createWebhookChat({
    agentId: agent.id,
    userId: agent.userId,
    threadId,
    source: 'webhook',
    metadata: JSON.stringify(payload)
  });

  // Save the user message
  await db_operations.addMessage({
    chatId: chat.id,
    role: 'user',
    content: message
  });

  // Get agent response
  const config = JSON.parse(agent.config);
  const response = await sendMessage(
    agent.userId,
    threadId,
    config.assistantId,
    message
  );

  // Save the assistant message
  await db_operations.addMessage({
    chatId: chat.id,
    role: 'assistant',
    content: response
  });

  return response;
}
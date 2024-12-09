import Dexie, { Table } from 'dexie';
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string(),
  name: z.string().nullable(),
  companyName: z.string().nullable(),
  openaiApiKey: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const aiAgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  config: z.string(),
  userId: z.string(),
  webhookSecret: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const chatSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  userId: z.string(),
  threadId: z.string(),
  source: z.enum(['web', 'webhook']),
  metadata: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const messageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  createdAt: z.string()
});

export const feedbackSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  chatId: z.string(),
  comment: z.string(),
  createdAt: z.string()
});

export type User = z.infer<typeof userSchema>;
export type AIAgent = z.infer<typeof aiAgentSchema>;
export type Chat = z.infer<typeof chatSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Feedback = z.infer<typeof feedbackSchema>;

class AppDatabase extends Dexie {
  users!: Table<User>;
  aiAgents!: Table<AIAgent>;
  chats!: Table<Chat>;
  messages!: Table<Message>;
  feedbacks!: Table<Feedback>;

  constructor() {
    super('AppDatabase');
    this.version(5).stores({
      users: 'id, email',
      aiAgents: 'id, userId, webhookSecret',
      chats: 'id, agentId, userId, threadId, source',
      messages: 'id, chatId, createdAt',
      feedbacks: 'id, agentId, chatId, createdAt'
    });
  }
}

const db = new AppDatabase();

export const db_operations = {
  createUser: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    
    const user: User = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };

    await db.users.add(user);
    return user;
  },

  findUserByEmail: async (email: string) => {
    return await db.users.where('email').equals(email).first();
  },

  findUserById: async (id: string) => {
    return await db.users.get(id);
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const now = new Date().toISOString();
    await db.users.update(id, { ...data, updatedAt: now });
    return await db.users.get(id);
  },

  createAgent: async (data: Omit<AIAgent, 'id' | 'webhookSecret' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const webhookSecret = crypto.randomUUID();
    
    const agent: AIAgent = {
      id,
      webhookSecret,
      ...data,
      createdAt: now,
      updatedAt: now
    };

    await db.aiAgents.add(agent);
    return agent;
  },

  findAgentByWebhookSecret: async (webhookSecret: string) => {
    return await db.aiAgents.where('webhookSecret').equals(webhookSecret).first();
  },

  updateAgent: async (id: string, data: Partial<AIAgent>) => {
    const now = new Date().toISOString();
    await db.aiAgents.update(id, { ...data, updatedAt: now });
    return await db.aiAgents.get(id);
  },

  getAgentsByUser: async (userId: string) => {
    return await db.aiAgents.where('userId').equals(userId).toArray();
  },

  deleteAgent: async (id: string) => {
    await db.aiAgents.delete(id);
  },

  createChat: async (data: Omit<Chat, 'id' | 'source' | 'metadata' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    
    const chat: Chat = {
      id,
      source: 'web',
      metadata: null,
      ...data,
      createdAt: now,
      updatedAt: now
    };

    await db.chats.add(chat);
    return chat;
  },

  createWebhookChat: async (data: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    
    const chat: Chat = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };

    await db.chats.add(chat);
    return chat;
  },

  getChatsByUser: async (userId: string) => {
    return await db.chats.where('userId').equals(userId).toArray();
  },

  getChatsByAgent: async (agentId: string) => {
    return await db.chats
      .where('agentId')
      .equals(agentId)
      .reverse()
      .sortBy('createdAt');
  },

  getChatCount: async (userId: string) => {
    return await db.chats.where('userId').equals(userId).count();
  },

  addMessage: async (data: Omit<Message, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    
    const message: Message = {
      id,
      ...data,
      createdAt: now
    };

    await db.messages.add(message);
    return message;
  },

  getMessagesByChat: async (chatId: string) => {
    return await db.messages
      .where('chatId')
      .equals(chatId)
      .sortBy('createdAt');
  },

  addFeedback: async (data: Omit<Feedback, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    
    const feedback: Feedback = {
      id,
      ...data,
      createdAt: now
    };

    await db.feedbacks.add(feedback);
    return feedback;
  },

  getFeedbacksByAgent: async (agentId: string) => {
    return await db.feedbacks
      .where('agentId')
      .equals(agentId)
      .reverse()
      .sortBy('createdAt');
  },

  getFeedbacksByChat: async (chatId: string) => {
    return await db.feedbacks
      .where('chatId')
      .equals(chatId)
      .reverse()
      .sortBy('createdAt');
  }
};
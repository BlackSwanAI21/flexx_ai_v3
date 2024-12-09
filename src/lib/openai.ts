import OpenAI from 'openai';
import { db_operations } from './db';

export async function createOpenAIAssistant(
  userId: string,
  name: string,
  instructions: string,
  model: string
) {
  const user = await db_operations.findUserById(userId);
  if (!user?.openaiApiKey) {
    throw new Error('OpenAI API key not found. Please add it in settings.');
  }

  const openai = new OpenAI({
    apiKey: user.openaiApiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    const assistant = await openai.beta.assistants.create({
      name,
      instructions,
      model,
    });

    return assistant.id;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw error;
  }
}

export async function updateOpenAIAssistant(
  userId: string,
  assistantId: string,
  name: string,
  instructions: string,
  model: string
) {
  const user = await db_operations.findUserById(userId);
  if (!user?.openaiApiKey) {
    throw new Error('OpenAI API key not found. Please add it in settings.');
  }

  const openai = new OpenAI({
    apiKey: user.openaiApiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    await openai.beta.assistants.update(
      assistantId,
      {
        name,
        instructions,
        model,
      }
    );
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw error;
  }
}

export async function deleteOpenAIAssistant(userId: string, assistantId: string) {
  const user = await db_operations.findUserById(userId);
  if (!user?.openaiApiKey) {
    throw new Error('OpenAI API key not found. Please add it in settings.');
  }

  const openai = new OpenAI({
    apiKey: user.openaiApiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    await openai.beta.assistants.del(assistantId);
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw error;
  }
}

export async function createThread(userId: string) {
  const user = await db_operations.findUserById(userId);
  if (!user?.openaiApiKey) {
    throw new Error('OpenAI API key not found. Please add it in settings.');
  }

  const openai = new OpenAI({
    apiKey: user.openaiApiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    const thread = await openai.beta.threads.create();
    return thread.id;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw error;
  }
}

export async function sendMessage(
  userId: string,
  threadId: string,
  assistantId: string,
  message: string
) {
  const user = await db_operations.findUserById(userId);
  if (!user?.openaiApiKey) {
    throw new Error('OpenAI API key not found. Please add it in settings.');
  }

  const openai = new OpenAI({
    apiKey: user.openaiApiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    // Add the message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    if (runStatus.status === 'completed') {
      // Get the messages
      const messages = await openai.beta.threads.messages.list(threadId);
      return messages.data[0].content[0].text.value;
    } else {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw error;
  }
}

export async function getThreadMessages(userId: string, threadId: string) {
  const user = await db_operations.findUserById(userId);
  if (!user?.openaiApiKey) {
    throw new Error('OpenAI API key not found. Please add it in settings.');
  }

  const openai = new OpenAI({
    apiKey: user.openaiApiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    const messages = await openai.beta.threads.messages.list(threadId);
    return messages.data.map(message => ({
      role: message.role,
      content: message.content[0].text.value
    }));
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw error;
  }
}
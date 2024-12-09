import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db_operations } from './db';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  companyName: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export async function register(input: RegisterInput) {
  const existingUser = await db_operations.findUserByEmail(input.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  
  const user = await db_operations.createUser({
    email: input.email,
    password: hashedPassword,
    name: input.name,
    companyName: input.companyName || null,
  });

  return { 
    id: user.id, 
    email: user.email, 
    name: user.name 
  };
}

export async function login(input: LoginInput) {
  const user = await db_operations.findUserByEmail(input.email);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const validPassword = await bcrypt.compare(input.password, user.password);
  if (!validPassword) {
    throw new Error('Invalid credentials');
  }

  return { 
    id: user.id, 
    email: user.email, 
    name: user.name 
  };
}
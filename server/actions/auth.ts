'use server';

import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signUpSchema } from '@/lib/validations/auth';

export async function registerUser(formData: FormData) {
  try {
    const data = {
      email: formData.get('email') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    // Validate input
    const validatedData = signUpSchema.parse(data);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return { success: false, error: 'Email already registered' };
      }
      if (existingUser.username === validatedData.username) {
        return { success: false, error: 'Username already taken' };
      }
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        password: hashedPassword,
        authProvider: 'credentials',
      },
    });

    return {
      success: true,
      message: 'Account created successfully! Please sign in.',
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.name === 'ZodError') {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }

    return {
      success: false,
      error: 'Failed to create account. Please try again.',
    };
  }
}

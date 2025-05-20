// Import env loader first to ensure environment variables are loaded
import '../utils/env';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db from '../database';
import { users } from '../database/schema/users';
import { eq } from 'drizzle-orm';

// Function to hash password
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function seedUser() {
  try {
    console.log('Seeding test user...');
    
    // Check if test user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, 'test@example.com'))
      .limit(1);
    
    if (existingUser.length > 0) {
      console.log('Test user already exists.');
      process.exit(0);
    }
    
    // Create a test user
    const userId = uuidv4();
    const hashedPassword = await hashPassword('password123');
    
    // Insert user into database
    await db.insert(users).values({
      id: userId,
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      picture: 'https://ui-avatars.com/api/?name=Test+User&background=random',
      createdAt: new Date().toISOString(),
    });
    
    console.log('Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('Error seeding test user:', error);
    process.exit(1);
  }
}

seedUser();
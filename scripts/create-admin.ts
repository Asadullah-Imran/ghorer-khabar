/**
 * Script to create an admin user
 * Run with: npx tsx scripts/create-admin.ts
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { config } from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import readline from 'readline';

config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => new Promise((resolve) => rl.question(query, resolve));

async function createAdminUser() {
  try {
    console.log('\n=== Create Admin User ===\n');

    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const name = await question('Enter admin name (optional): ');

    if (!email || !password) {
      console.error('❌ Email and password are required!');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.log('\n⚠️  User already exists!');
      const update = await question('Do you want to update this user to admin? (yes/no): ');
      
      if (update.toLowerCase() === 'yes' || update.toLowerCase() === 'y') {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update user
        await prisma.user.update({
          where: { email: email.toLowerCase() },
          data: {
            role: 'ADMIN',
            password: hashedPassword,
            ...(name && { name }),
          },
        });

        console.log('\n✅ User updated successfully!');
        console.log(`Email: ${email}`);
        console.log(`Role: ADMIN`);
      } else {
        console.log('\n❌ Operation cancelled.');
      }
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new admin user
      const user = await prisma.user.create({
        data: {
          id: `admin-${Date.now()}`,
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name || 'Admin',
          role: 'ADMIN',
          authProvider: 'EMAIL',
          emailVerified: true,
        },
      });

      console.log('\n✅ Admin user created successfully!');
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
    }

    console.log('\n🔐 You can now login at /admin-login\n');
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
    await pool.end();
  }
}

createAdminUser();

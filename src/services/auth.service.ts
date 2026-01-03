import { prisma } from "@/lib/prisma/prisma";
import { hashPassword, comparePassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";


export async function loginUser(data: {
  email: string;
  password: string;
}) {
  try {
    // 1. Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // 2. If user doesn't exist, throw error
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // 3. Check if user has a password (might be OAuth user)
    if (!user.password) {
      throw new Error("Invalid email or password");
    }

    // 4. Compare the provided password with the hashed password in DB
    const isValid = await comparePassword(data.password, user.password);

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // 5. Generate JWT Token
    const token = signToken({ userId: user.id });

    // 6. Return safe user data and token
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  } catch (error: any) {
    console.error("Login Service Error:", error);
    throw error;
  }
  finally {
    // Any cleanup tasks can be performed here
    await prisma.$disconnect()
  }
}



import { Secret, sign, SignOptions, verify } from "jsonwebtoken";

// Ensure the secret exists at startup
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export function signToken(payload: Record<string, any>) {
  try {
    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as any,
    };
    return sign(payload as any, JWT_SECRET as any, options as any);
  } catch (error) {
    console.error("JWT Signing Error:", error);
    throw new Error("Could not create authentication token");
  }
}

export function verifyToken(token: string) {
  try {
    return verify(token, JWT_SECRET as Secret);
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null; // Return null instead of crashing if the token is invalid
  }
}

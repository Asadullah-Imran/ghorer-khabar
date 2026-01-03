import jwt from "jsonwebtoken";

// Ensure the secret exists at startup
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export function signToken(payload: object) {
  try {
    // We cast to string to satisfy TypeScript
    return jwt.sign(payload, JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
  } catch (error) {
    console.error("JWT Signing Error:", error);
    throw new Error("Could not create authentication token");
  }
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET as string);
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null; // Return null instead of crashing if the token is invalid
  }
}
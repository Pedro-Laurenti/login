import { NextApiRequest, NextApiResponse } from "next";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await jwtVerify(token, SECRET_KEY);
    res.status(200).json({ message: "Authenticated" });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
}
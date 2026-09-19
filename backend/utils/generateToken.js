import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "gym_website_jwt_secret_key_2026_fallback",
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};


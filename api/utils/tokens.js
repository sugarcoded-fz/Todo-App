import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
      issuer: "todo-app",
      audience: "user",
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
      issuer: "todo-app",
      audience: "user",
    }
  );
};
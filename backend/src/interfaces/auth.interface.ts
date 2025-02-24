import { Request } from "express";
import { User } from "@prisma/client";

export interface DataStoredInAccessToken {
  type: "accessToken";
  user_id: number;
  user_email: string;
}

export interface DataStoredInRefreshToken {
  type: "refreshToken";
  expiredTime: string;
  user_id: number;
  user_email: string;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface UserWithoutPassword {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

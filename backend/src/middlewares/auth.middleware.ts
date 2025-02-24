import { NextFunction, Response } from "express";
import { verify } from "jsonwebtoken";
import { JWT_ACCESS_TOKEN_SECRET } from "@config";
import { HttpException } from "@exceptions/HttpException";
import {
  DataStoredInAccessToken,
  RequestWithUser,
} from "@interfaces/auth.interface";
import { db } from "@/libs/db";

const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const Authorization =
      req.cookies["Authorization"] ||
      (req.header("Authorization")
        ? req.header("Authorization").split("Bearer ")[1]
        : null);

    if (Authorization) {
      const secretKey: string = JWT_ACCESS_TOKEN_SECRET;
      const verificationResponse = verify(
        Authorization,
        secretKey,
      ) as DataStoredInAccessToken;
      const userId = verificationResponse.user_id;

      const findUser = await db.user.findUnique({
        where: { id: Number(userId) },
      });

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, "Wrong authentication token"));
      }
    } else {
      next(new HttpException(404, "Authentication token missing"));
    }
  } catch (error) {
    next(new HttpException(401, "Wrong authentication token"));
  }
};

export default authMiddleware;

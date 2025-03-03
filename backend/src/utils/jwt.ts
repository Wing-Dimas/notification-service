import { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET } from "@/config";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import {
  DataStoredInAccessToken,
  DataStoredInRefreshToken,
  TokenData,
} from "@/interfaces/auth.interface";

/**
 * Create JWT Access Token
 * @param  {object} user to be inserted
 * @returns {string} return jwt token
 */
const createJWTAccessToken = (user: User): TokenData => {
  // create a JWT Token
  const oneDayInSeconds = 1 * 60 * 60;

  const DataStoredInAccessToken: DataStoredInAccessToken = {
    type: "accessToken",
    user_id: user.id,
    user_email: user.email,
  };
  const token = jwt.sign(DataStoredInAccessToken, JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: oneDayInSeconds,
  });

  return { expiresIn: oneDayInSeconds, token: token };
};

/**
 * Create JWT Refresh Token
 * @returns {string} return jwt token
 */
const createJWTRefreshToken = (user: User): TokenData => {
  // create a JWT Token
  const oneMonthInSeconds = 1 * 30 * 24 * 60 * 60;

  const dataStoredInRefreshToken: DataStoredInRefreshToken = {
    type: "refreshToken",
    expiredTime: "1 month",
    user_id: user.id,
    user_email: user.email,
  };
  const token = jwt.sign(dataStoredInRefreshToken, JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: oneMonthInSeconds,
  });

  return { expiresIn: oneMonthInSeconds, token };
};

/**
 * Validate JWT Token
 * @param  {string} token to be validated
 * @returns {object} return if jwt is valid or not
 */
const validateJWTAccessToken = (token: string) => {
  try {
    const decodedToken = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);

    const result = decodedToken;

    return result;
  } catch (error) {
    throw new Error("token is not valid");
  }
};

/**
 * Validate JWT Token
 * @param  {string} token to be validated
 * @returns {object} return if jwt is valid or not
 */
const validateJWTRefreshToken = (token: string) => {
  try {
    const decodedToken = jwt.verify(token, JWT_REFRESH_TOKEN_SECRET);

    const result = decodedToken;

    return result;
  } catch (error) {
    throw new Error("token is not valid");
  }
};

export {
  createJWTAccessToken,
  createJWTRefreshToken,
  validateJWTAccessToken,
  validateJWTRefreshToken,
};

import { compare, genSalt, hash } from "bcrypt";
import { User } from "@prisma/client";
import { CreateUserDto, LoginUserDto } from "@dtos/users.dto";
import { HttpException } from "@exceptions/HttpException";
import {
  DataStoredInRefreshToken,
  TokenData,
} from "@interfaces/auth.interface";
import { isEmpty } from "@/utils/utils";
import {
  createJWTAccessToken,
  createJWTRefreshToken,
  validateJWTRefreshToken,
} from "@/utils/jwt";
import { db } from "@/libs/db";

class AuthService {
  public users = db.user;

  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

    const findUser: User = await this.users.findUnique({
      where: { email: userData.email },
    });
    if (findUser)
      throw new HttpException(
        409,
        `This email ${userData.email} already exists`,
      );

    const salt = await genSalt(10);
    const hashedPassword = await hash(userData.password, salt);
    const createUserData: Promise<User> = this.users.create({
      data: { ...userData, password: hashedPassword },
    });

    return createUserData;
  }

  public async login(
    userData: LoginUserDto,
  ): Promise<{ cookie: string; findUser: User; accessToken: TokenData }> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

    const findUser: User = await this.users.findUnique({
      where: { email: userData.email },
    });

    if (!findUser)
      throw new HttpException(
        409,
        `This email ${userData.email} was not found`,
      );

    const isPasswordMatching: boolean = await compare(
      userData.password,
      findUser.password,
    );
    if (!isPasswordMatching)
      throw new HttpException(409, "Password is not matching");

    const accessToken = createJWTAccessToken(findUser);
    const refreshToken = createJWTRefreshToken(findUser);

    // const tokenData = this.createAccesToken(findUser);
    const cookie = this.createCookie(refreshToken);

    return { cookie, findUser, accessToken };
  }

  public async logout(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

    const findUser: User = await this.users.findFirst({
      where: { email: userData.email, password: userData.password },
    });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=Bearer ${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}; SameSite=none;`;
  }

  public async getNewToken(refreshToken: string | null): Promise<TokenData> {
    if (refreshToken) {
      const token = refreshToken.split(" ")[1];
      const decodedToken = validateJWTRefreshToken(
        token,
      ) as DataStoredInRefreshToken;
      if (decodedToken) {
        const findUser: User = await this.users.findUnique({
          where: { email: decodedToken.user_email },
        });
        const newAccessToken = createJWTAccessToken(findUser);

        return newAccessToken;
      } else {
        throw new HttpException(401, "Refresh Token expired");
      }
    } else {
      throw new HttpException(400, "Missing Refresh token");
    }
  }
}

export default AuthService;

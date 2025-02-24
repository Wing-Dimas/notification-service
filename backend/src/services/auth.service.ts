import { compare, genSalt, hash } from "bcrypt";
import { User } from "@prisma/client";
import { CreateUserDto, LoginUserDto } from "@dtos/users.dto";
import { HttpException } from "@exceptions/HttpException";
import { TokenData } from "@interfaces/auth.interface";
import { isEmpty } from "@/utils/utils";
import { createJWTAccessToken, createJWTRefreshToken } from "@/utils/jwt";
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

    console.log(findUser);
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

  //   public createAccesToken(user: User): TokenData {
  //     const dataStoredInToken: DataStoredInToken = {
  //       id: user.id,
  //       email: user.email,
  //     };
  //     const secretKey: string = JWT_ACCESS_TOKEN_SECRET;
  //     const expiresIn: number = 24 * 60 * 60;

  //     return {
  //       expiresIn,
  //       token: sign(dataStoredInToken, secretKey, { expiresIn }),
  //     };
  //   }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=Bearer ${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}; SameSite=none;`;
  }
}

export default AuthService;

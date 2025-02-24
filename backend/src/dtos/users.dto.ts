import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;

  @IsString()
  public username: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  public username: string;

  @IsString()
  @IsOptional()
  public email: string;

  @IsString()
  @IsOptional()
  public password: string;
}

export class LoginUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}

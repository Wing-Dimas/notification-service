import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { RequestHandler } from "express";
import { HttpException } from "@exceptions/HttpException";
import { UnionTypeWithString } from "@/utils/utils";

const validationMiddleware = (
  type: any,
  value: UnionTypeWithString<"body" | "query" | "params"> = "body",
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req, res, next) => {
    validate(plainToInstance(type, req[value as string]), {
      skipMissingProperties,
      whitelist,
      forbidNonWhitelisted,
    }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) => Object.values(error.constraints))
          .join(", ");
        next(new HttpException(400, message));
      } else {
        next();
      }
    });
  };
};

export default validationMiddleware;

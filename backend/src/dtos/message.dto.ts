import { IsString } from "class-validator";

export class SendMessageDto {
  @IsString()
  public message: string;
}

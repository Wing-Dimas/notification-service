import { IsOptional, IsString } from "class-validator";

export class GetMessageTelegramDto {
  @IsString()
  @IsOptional()
  public search?: string;

  @IsString()
  @IsOptional()
  public page?: number;

  @IsString()
  @IsOptional()
  public order_by?: string;

  @IsString()
  @IsOptional()
  public sort?: "asc" | "desc";
}

export class GetSingleMessageTelegramDto {
  @IsString()
  public id: string;
}

export class DeleteMessageTelegramDto {
  @IsString()
  public id: string;
}

export class EditMessageTelegramDto {
  @IsString()
  public id: string;
}

export class SendMessageTelegramDto {
  @IsString()
  public id: string;
}

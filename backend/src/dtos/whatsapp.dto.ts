import { IsOptional, IsString } from "class-validator";

export class GetMessageWADto {
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

export class GetSingleMessageWADto {
  @IsString()
  public id: string;
}

export class DeleteMessageWADto {
  @IsString()
  public id: string;
}

export class EditMessageWADto {
  @IsString()
  public id: string;
}

export class SendMessageWADto {
  @IsString()
  public id: string;
}

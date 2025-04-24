import { IsBoolean, IsOptional, IsString } from "class-validator";

export class GetApiKeysDto {
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

export class CreateApiKeyDto {
  @IsString()
  public name: string;
}

export class UpdateApiKeyDto {
  @IsString()
  @IsOptional()
  public name: string;

  @IsBoolean()
  @IsOptional()
  public is_active: boolean;
}

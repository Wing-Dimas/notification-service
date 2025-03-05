import { IsNumber, IsString } from "class-validator";

export class GetMessageDto {
  @IsString()
  public search?: string;

  @IsNumber()
  public page?: number;

  @IsString()
  public order_by?: string;

  @IsString()
  public sort?: "asc" | "desc";
}

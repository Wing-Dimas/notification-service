import { IsString } from "class-validator";

export class StartJobDTO {
  @IsString()
  public name: string;
}

export class StopJobDTO {
  @IsString()
  public name: string;
}

export class ReloadJobDTO {
  @IsString()
  public name: string;
}

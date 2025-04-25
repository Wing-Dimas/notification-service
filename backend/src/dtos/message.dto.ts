import { IsEnum, IsString } from "class-validator";

enum NotificationType {
  telegram = "telegram",
  whatsapp = "whatsapp",
}

export class SendMessageDto {
  @IsString()
  public message: string;

  @IsString()
  public receiver: string;

  @IsEnum(NotificationType, {
    message: "notification type must be telegram or whatsapp",
  })
  public notification_type: NotificationType;
}

import { SendMessageDto } from "@/dtos/message.dto";
import { HttpException } from "@/exceptions/HttpException";
import { sock } from "@/libs/whatsapp";

class MessageService {
  public async sendMessage(message: SendMessageDto): Promise<void> {
    try {
      console.log(message.message);
      sock.sendMessage(sock.user.id, { text: message.message });
    } catch (error) {
      throw new HttpException(500, `Internal Server Error: ${error.message}`);
    }
  }
}

export default MessageService;

import { SendMessageDto } from "@/dtos/message.dto";
import { HttpException } from "@/exceptions/HttpException";
import ConnectionSession from "@/libs/whatsapp/ConnectionSession";
// import { sock } from "@/libs/whatsapp";

class MessageService extends ConnectionSession {
  public async sendMessage(message: SendMessageDto): Promise<void> {
    try {
      console.log(message);
      const client = this.getClient();
      //   sock.sendMessage(sock.user.id, { text: message.message });
      if (client) {
        // await client.sendMessage("6282138441641@s.whatsapp.net", {
        //   text: message.message,
        // });

        await client.sendMessage(client.user.id, { text: message.message });
      }
    } catch (error) {
      throw new HttpException(500, `Internal Server Error: ${error.message}`);
    }
  }
}

export default MessageService;

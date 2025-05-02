import { SendMessageDto } from "@/dtos/message.dto";
import { HttpException } from "@/exceptions/HttpException";
import AMQPClient from "@/libs/amqp-client";
import { db } from "@/libs/db";
import { TelegramBotClient } from "@/libs/telegram";
import { WhatsappClient } from "@/libs/whatsapp";
import { Message } from "@prisma/client";
import fs from "fs";

class MessageService {
  public message = db.message;

  public async getTotalMessage(): Promise<number> {
    try {
      const count = await this.message.count({ where: { deleted_at: null } });
      return count;
    } catch (error) {
      throw new HttpException(500, `Internal Server Error: ${error.message}`);
    }
  }

  public async getMessage(): Promise<Message[]> {
    try {
      const messages = await this.message.findMany({
        where: { deleted_at: null },
        take: 5,
        skip: 0,
        orderBy: { created_at: "desc" },
      });

      return messages;
    } catch (error) {
      throw new HttpException(500, `Internal Server Error: ${error.message}`);
    }
  }

  public async getDailyStatusMessage(): Promise<any> {
    try {
      const now = new Date();
      // Hitung awal hari ini dalam UTC
      const startOfToday = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );

      startOfToday.setUTCHours(0, 0, 0, 0); // Set waktu ke awal hari (00:00:00)

      const result = await this.message.groupBy({
        by: ["status"],
        where: {
          created_at: {
            gte: startOfToday,
          },
        },
        _count: {
          id: true,
        },
      });

      // Daftar status yang diharapkan
      const expectedStatuses = ["true", "false"];

      // Buat template awal dengan nilai 0
      const statusCounts = Object.fromEntries(
        expectedStatuses.map(status => [status, 0]),
      );

      result.forEach(item => {
        statusCounts[item.status.toString()] = item._count.id;
      });

      return expectedStatuses.map(status => ({
        category: status,
        total: statusCounts[status],
      }));
    } catch (error) {
      throw new HttpException(500, `Internal Server Error: ${error.message}`);
    }
  }

  public async getWeeklyData(): Promise<any> {
    try {
      const today = new Date();
      const oneWeekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000); // 6 hari lalu

      // Atur waktu UTC
      oneWeekAgo.setUTCHours(0, 0, 0, 0); // min
      today.setUTCHours(23, 59, 59, 999); // max

      const weekData = await this.message.findMany({
        where: {
          created_at: {
            gte: oneWeekAgo,
            lte: today,
          },
        },
      });

      // Buat map untuk menyimpan data per hari
      const dailyDataMap = {};

      // Inisialisasi map dengan semua tanggal dalam seminggu (UTC)
      for (let i = 0; i < 7; i++) {
        // Gunakan timestamp UTC untuk perhitungan yang konsisten
        const currentDate = new Date(
          oneWeekAgo.getTime() + i * 24 * 60 * 60 * 1000,
        );

        // Format tanggal sebagai string UTC (YYYY-MM-DD)
        const formattedDate = currentDate.toISOString().split("T")[0];
        dailyDataMap[formattedDate] = [];
      }

      // Kelompokkan data berdasarkan tanggal UTC
      weekData.forEach(item => {
        // Pastikan createdAt di-parse sebagai tanggal UTC
        const itemDate = new Date(item.created_at).toISOString().split("T")[0];

        if (dailyDataMap[itemDate]) {
          dailyDataMap[itemDate].push(item);
        }
      });

      // Konversi map ke array hasil
      const dailyResults = Object.keys(dailyDataMap).map(date => ({
        date,
        value: dailyDataMap[date].length,
      }));

      // Urutkan hasil berdasarkan tanggal (tidak perlu konversi Date)
      dailyResults.sort((a, b) => a.date.localeCompare(b.date));

      return dailyResults;
    } catch (error) {
      throw new HttpException(500, `Internal Server Error: ${error.message}`);
    }
  }

  public async sendMessage(
    sendMessageData: SendMessageDto,
    file?: Express.Multer.File,
  ): Promise<void> {
    const amqpClient = new AMQPClient();
    const channel = await amqpClient.connect();

    try {
      const { notification_type: notificationType } = sendMessageData;

      let receiver: any;

      switch (notificationType) {
        case "telegram":
          receiver = await TelegramBotClient.getReceiver(
            sendMessageData.receiver,
          );
          if (!receiver)
            throw new HttpException(
              400,
              "Receiver not found, please connect receiver to bot first",
            );
          break;
        case "whatsapp":
          const whastappClient = WhatsappClient.getInstance(); // get whatsapp whastappClient instance
          if (!whastappClient)
            throw new HttpException(
              503,
              "Whatsapp is not running, please try again later or choose another notification type",
            );
          receiver = whastappClient.formatPhoneNumber(sendMessageData.receiver);
          if (!receiver) throw new HttpException(400, "Invalid receiver");
          break;
        default:
          throw new HttpException(400, "Invalid notification type");
      }

      let data: any = {
        ...sendMessageData,
      };

      if (file) {
        const fileData = fs.readFileSync(file.path);
        const fileDataBase64 = fileData.toString("base64");
        data = {
          ...data,
          filename: file.filename,
          data: fileDataBase64,
        };
      }

      channel.publish(
        "notification",
        notificationType,
        Buffer.from(JSON.stringify(data)),
        {
          persistent: !!file,
        },
      );

      if (file) fs.unlinkSync(file.path);
    } catch (error) {
      throw new HttpException(error.status, error.message);
    } finally {
      await amqpClient.close();
    }
  }
}

export default MessageService;

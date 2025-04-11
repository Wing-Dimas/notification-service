import { HttpException } from "@/exceptions/HttpException";
import { db } from "@/libs/db";
import { Message } from "@prisma/client";

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
}

export default MessageService;

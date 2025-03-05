import { SendMessageDto } from "@/dtos/message.dto";
import { GetMessageDto } from "@/dtos/whatsapp.dto";
import { HttpException } from "@/exceptions/HttpException";
import { db } from "@/libs/db";
import { HistoryMessageWA, Prisma } from "@prisma/client";
// import { ConnectionSession } from "@/libs/whatsapp";
import { createPaginator, PaginatedResult } from "prisma-pagination";

class WhatsappService {
  public historyMessage = db.historyMessageWA;
  public paginator = createPaginator({ perPage: 2 });

  public async getMessage(
    query: GetMessageDto,
  ): Promise<PaginatedResult<HistoryMessageWA>> {
    try {
      const search = query.search?.toLowerCase() || "";
      const page = query.page || 1;
      const order_by = query.order_by || "created_at";
      const sort = query.sort || "desc";

      const result = await this.paginator<
        HistoryMessageWA,
        Prisma.HistoryMessageWAFindManyArgs
      >(
        this.historyMessage,
        {
          orderBy: { [order_by]: sort },
          where: { payload: { contains: search } },
        },
        { page: page },
      );

      return result;
    } catch (error) {
      throw new HttpException(500, `Internal Server Error: ${error.message}`);
    }
  }
}

export default WhatsappService;

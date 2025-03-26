import { NODE_ENV } from "@/config";
import { db } from "../db";

class SessionDB {
  public sessions = db.session;

  private async findSession(session_name: string) {
    const findSession = await this.sessions.findFirst({
      where: { session_name: session_name },
    });

    return findSession;
  }

  public async createSessionDB(session_name: string, session_number: string) {
    if (NODE_ENV === "development") {
      console.log(session_name, session_number);
    }

    const findSession = await this.findSession(session_name);
    if (findSession) {
      await this.updateSessionDB(session_name, session_number);
    } else {
      await this.sessions.create({
        data: {
          session_name: session_name,
          session_number: session_number,
        },
      });
    }
  }

  public async deleteSessionDB(session_name: string) {
    const session = await this.findSession(session_name);
    if (session) {
      await this.sessions.delete({ where: { session_name: session_name } });
    }
  }

  public async updateSessionDB(
    session_name?: string,
    session_number?: string,
    send_first_message?: boolean,
  ) {
    const session = await this.findSession(session_name);
    if (session) {
      await this.sessions.update({
        where: { session_name: session_name },
        data: {
          session_number: session_number,
          send_first_message: !!send_first_message,
        },
      });
    }
  }

  public async findSessionDB(session_name: string) {
    const session = await this.findSession(session_name);
    return session;
  }

  public async updateStatusSessionDB(session_name: string, status: string) {
    const session = await this.findSession(session_name);
    if (session) {
      await this.sessions.update({
        where: { session_name: session_name },
        data: { status: status },
      });
    }
  }

  public async getStatusSessionDB(session_name: string) {
    const session = await this.findSession(session_name);
    if (session) {
      return session.status;
    }
    return null;
  }
}

export default SessionDB;

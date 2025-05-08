import App from "@/app";

import AuthRoute from "@routes/auth.route";
import IndexRoute from "@routes/index.route";
import UsersRoute from "@routes/users.route";
import MessageRoute from "@routes/message.route";
import SessionRoute from "@routes/session.route";
import WhatsappMessageRoute from "./routes/whatsapp.route";
import TelegramRoute from "./routes/telegram.route";
import ApiKeyRoute from "./routes/api-key.route";
import JobRoute from "./routes/jobs.route";

import validateEnv from "@utils/validateEnv";

validateEnv();

const app = new App([
  new IndexRoute(),
  new UsersRoute(),
  new AuthRoute(),
  new MessageRoute(),
  new SessionRoute(),
  new WhatsappMessageRoute(),
  new TelegramRoute(),
  new ApiKeyRoute(),
  new JobRoute(),
]);

app.listen();

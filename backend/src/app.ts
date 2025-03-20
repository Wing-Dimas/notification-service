import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { NODE_ENV, PORT, LOG_FORMAT, SESSION_NAME } from "@config";
import { Routes } from "@interfaces/routes.interface";
import errorMiddleware from "@middlewares/error.middleware";
import { logger, stream } from "@utils/logger";
import { app, server } from "@/libs/socket";
import { ConnectionSession } from "./libs/whatsapp";
import Schedule from "@jobs/index";
import path from "path";

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = app;
    this.env = NODE_ENV || "development";
    this.port = PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.initializeWhatsapp();
    this.initializeScheduler();
    this.initializeWebApp();
  }

  public listen() {
    server.listen(this.port, async () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(
      cors({
        origin: "*",
        credentials: true,
      }),
    );
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:"], // Mengizinkan data URI untuk gambar
            styleSrc: ["'self'", "'unsafe-inline'"], // Izinkan inline styles
            connecSrc: ["'self'", "*"],
          },
        },
      }),
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use("/uploads", express.static("uploads"));
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use("/", route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: "REST API",
          version: "1.0.0",
          description: "Example docs",
        },
      },
      apis: ["swagger.yaml"],
    };

    const specs = swaggerJSDoc(options);
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeWebApp() {
    // frontend must be built first
    if (NODE_ENV === "production") {
      this.app.use(express.static(path.join(__dirname, "../../frontend/dist")));
      this.app.get("*", (req, res) => {
        return res.sendFile(
          path.join(__dirname, "../../frontend/dist", "index.html"),
        );
      });
    }
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private async initializeWhatsapp() {
    new ConnectionSession().createSession(SESSION_NAME);
  }

  private initializeScheduler() {
    Schedule.run();
  }
}

export default App;

import { eventType } from "@/utils/eventTypeConstant";
import { filterClients } from "@/utils/wsUtils";
import type { Response, ErrorRequestHandler } from "express";

const sendDevError = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendProdError = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

export const errorHandler: ErrorRequestHandler = (err, req, res) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const env = process.env.NODE_ENV;

  const data = {
    type: eventType.Error,
    time: new Date().toISOString(),
    status: err.statusCode,
    method: req.method,
    message: err.message,
    url: req.url,
  };

  const server = req.wsInstance.getWss();
  filterClients(server, "/logger").forEach((c) => c.send(JSON.stringify(data)));

  if (env === "development") {
    console.error(err);
    sendDevError(err, res);
  } else {
    sendProdError(err, res);
  }
};

import { Hono } from "hono";
import { wakeTimesHandler } from "./routes/wake-times";

const app = new Hono();

app.post("/v1/wake-times", wakeTimesHandler);

export default app;

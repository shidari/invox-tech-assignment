import { Hono } from "hono";
import classification from "./classification";
import classes from "../classes";
import { swaggerUI } from "@hono/swagger-ui";
const app = new Hono();

app.get("/", swaggerUI({ url: "/openapi" }));
app.route("/classification", classification);
app.route("/classes", classes);

export default app;

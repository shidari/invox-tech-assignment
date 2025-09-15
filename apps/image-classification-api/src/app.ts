import { Hono } from "hono";
import api from "./routes/api";
import { openAPIRouteHandler } from "hono-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { basicAuth } from "hono/basic-auth";
import { bearerAuth } from "hono/bearer-auth";
const app = new Hono<{ Bindings: CloudflareBindings }>();

app.route("/api", api);
app.use(
  "/api/*",
  bearerAuth({
    verifyToken(token, c) {
      return token === c.env.API_TOKEN;
    },
  }),
);
app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Hono API",
        version: "1.1.0",
        description: "Image Classification API",
      },
    },
  }),
);
app.get("/", (c) => c.redirect("/doc"));
app.get(
  "/doc",
  basicAuth({
    verifyUser: (username, password, c) => {
      return username === c.env.USERNAME && password === c.env.PASSWORD;
    },
  }),
  swaggerUI({ url: "/openapi" }),
);

export { app };

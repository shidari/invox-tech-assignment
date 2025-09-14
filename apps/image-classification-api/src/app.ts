import { Hono } from "hono";
import api from "./routes/api";
import { openAPIRouteHandler } from "hono-openapi";
import { swaggerUI } from "@hono/swagger-ui";
const app = new Hono();

app.route("/api", api);

app.get(
	"/openapi",
	openAPIRouteHandler(app, {
		documentation: {
			info: {
				title: "Hono API",
				version: "1.0.0",
				description: "Image Classification API",
			},
		},
	}),
);
app.get("/", swaggerUI({ url: "/openapi" }));

export { app };

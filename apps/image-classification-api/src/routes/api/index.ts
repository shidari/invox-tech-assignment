import { Hono } from "hono";
import classification from "./classification";
const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});
app.route("/classification", classification);

export default app;

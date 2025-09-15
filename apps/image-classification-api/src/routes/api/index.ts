import { Hono } from "hono";
import classification from "./classification";
import classes from "../classes";
const app = new Hono();

app.get("/", (c) => c.redirect("/doc"));
app.route("/classification", classification);
app.route("/classes", classes);

export default app;

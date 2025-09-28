import { Router } from "express";
const route = Router();
import authRoute from "../routers/auth.route";
import { requestLogger } from "../middlewares/requestLogger";

route.use(requestLogger);

route.use("/auth", authRoute);

export default route;
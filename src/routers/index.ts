import { Router } from "express";
const route = Router();
import authRoute from "../routers/auth.route";
import submisionRoute from "../routers/submision.route";
import { requestLogger } from "../middlewares/requestLogger";
import { globalErrorHandler } from "../utils/ErrorHandler"

route.use(requestLogger);

route.use("/auth", authRoute);
route.use("/submission", submisionRoute);



route.use(globalErrorHandler)

export default route;
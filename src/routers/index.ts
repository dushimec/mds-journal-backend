import { Router } from "express";
const route = Router();
import authRoute from "../routers/auth.route";
import submisionRoute from "../routers/submision.route";
import ArticleRouter from "../routers/article.route";
import topicRoute from "../routers/topic.route";
import EditorialBoardMemberRoute from "../routers/editorialBoardMember.route";
import { requestLogger } from "../middlewares/requestLogger";
import { globalErrorHandler } from "../utils/ErrorHandler"
import aboutSectionRoute from "./aboutPageSection.Routes";

route.use(requestLogger);

route.use("/auth", authRoute);
route.use("/submission", submisionRoute);
route.use("/articles", ArticleRouter);
route.use("/topic", topicRoute);
route.use("/editorial-board-member", EditorialBoardMemberRoute);
route.use("/about-section", aboutSectionRoute);


route.use(globalErrorHandler)

export default route;
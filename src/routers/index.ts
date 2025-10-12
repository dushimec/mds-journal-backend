import { Router } from "express";
const route = Router();
import authRoute from "./auth.route";
import submisionRoute from "./submision.route";
import ArticleRouter from "./article.route";
import topicRoute from "./topic.route";
import EditorialBoardMemberRoute from "./editorialBoardMember.route";
import contactMessageRoute from './contactMessage.route';
import contactInfoRoute from './contactInfo.route';
import faqRoute from './faq.route';
import newsletterRoute from './newsletter.route';
import { requestLogger } from "../middlewares/requestLogger";
import { globalErrorHandler } from "../utils/ErrorHandler"
import aboutSectionRoute from "./aboutPageSection.Routes";
import homePageRouter from "./homePage.route";

route.use(requestLogger);

route.use("/", homePageRouter);
route.use("/auth", authRoute);
route.use("/submission", submisionRoute);
route.use("/articles", ArticleRouter);
route.use("/topic", topicRoute);
route.use("/editorial-board-member", EditorialBoardMemberRoute);
route.use("/contact-messages", contactMessageRoute);
route.use("/contact-info", contactInfoRoute);
route.use("/faqs", faqRoute);
route.use("/newsletter", newsletterRoute);
route.use("/about-sections", aboutSectionRoute);
route.use("/home-page", homePageRouter);

route.use(globalErrorHandler)

export default route;


import { Router } from "express";
const route = Router();
import authRoute from "./auth.route";
import userRoute from "./user.route";
import submisionRoute from "./submision.route";
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
import journalIssueRoute from "./journalIssue.route";
import authorGuidelineRoute from "./authorGuideline.route";
import swaggerRoute from "./swagger.route";
import logoRoute from "./logo.route"

route.use(requestLogger);

route.use("/", homePageRouter);
route.use("/auth", authRoute);
route.use("/users", userRoute);
route.use("/submission", submisionRoute);
route.use("/topic", topicRoute);
route.use("/editorial-board-member", EditorialBoardMemberRoute);
route.use("/contact-messages", contactMessageRoute);
route.use("/contact-info", contactInfoRoute);
route.use("/faqs", faqRoute);
route.use("/newsletter", newsletterRoute);
route.use("/about-sections", aboutSectionRoute);
route.use("/home-page", homePageRouter);
route.use("/issues", journalIssueRoute);
route.use("/author-guidelines", authorGuidelineRoute);
route.use("/docs", swaggerRoute);
route.use("/logo", logoRoute);

route.use(globalErrorHandler);

export default route;

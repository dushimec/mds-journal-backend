import { Router } from "express";
import { HomePageController } from "../controllers/homePage.controller";

const route = Router();

route
    .get("/", HomePageController.getHomePageData)

export default route;

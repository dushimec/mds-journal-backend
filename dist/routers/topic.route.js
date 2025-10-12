"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const topic_controller_1 = require("../controllers/topic.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const topicValidation_1 = require("../middlewares/validations/topicValidation");
const router = (0, express_1.Router)();
router
    .get("/", topic_controller_1.TopicController.getAll)
    .post("/", authMiddleware_1.authenticate, topicValidation_1.createTopicValidation, topic_controller_1.TopicController.create)
    .get("/:id", topicValidation_1.getByIdTopicValidation, topic_controller_1.TopicController.getById)
    .put("/:id", authMiddleware_1.authenticate, topicValidation_1.updateTopicValidation, topic_controller_1.TopicController.update)
    .delete("/:id", authMiddleware_1.authenticate, topicValidation_1.deleteTopicValidation, topic_controller_1.TopicController.delete);
exports.default = router;
//# sourceMappingURL=topic.route.js.map
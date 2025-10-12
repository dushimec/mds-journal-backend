"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const editorialBoardMember_controller_1 = require("../controllers/editorialBoardMember.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const editorialBoardMemberValidation_1 = require("../middlewares/validations/editorialBoardMemberValidation");
const router = (0, express_1.Router)();
router
    .get("/", editorialBoardMember_controller_1.EditorialBoardMemberController.getAll)
    .post("/", authMiddleware_1.authenticate, editorialBoardMemberValidation_1.createEditorialBoardMemberValidation, editorialBoardMemberValidation_1.validate, ...editorialBoardMember_controller_1.EditorialBoardMemberController.create)
    .get("/:id", editorialBoardMemberValidation_1.getByIdEditorialBoardMemberValidation, editorialBoardMemberValidation_1.validate, editorialBoardMember_controller_1.EditorialBoardMemberController.getById)
    .put("/:id", authMiddleware_1.authenticate, editorialBoardMemberValidation_1.updateEditorialBoardMemberValidation, editorialBoardMemberValidation_1.validate, ...editorialBoardMember_controller_1.EditorialBoardMemberController.update)
    .delete("/:id", authMiddleware_1.authenticate, editorialBoardMemberValidation_1.deleteEditorialBoardMemberValidation, editorialBoardMemberValidation_1.validate, editorialBoardMember_controller_1.EditorialBoardMemberController.delete);
exports.default = router;
//# sourceMappingURL=editorialBoardMember.route.js.map
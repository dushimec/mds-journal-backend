"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSection = exports.updateSection = exports.getSectionById = exports.getAllSections = exports.createSection = void 0;
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
// =========================
// Create Section
// =========================
const createSection = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { section, title, content, order } = req.body;
        // 🛑 Check if the section already exists
        const existingSection = await database_1.prisma.aboutPageSection.findUnique({
            where: { section },
        });
        if (existingSection) {
            res.status(400).json({ message: `Section "${section}" already exists.` });
            return;
        }
        // ✅ Create new section
        const newSection = await database_1.prisma.aboutPageSection.create({
            data: { section, title, content, order },
        });
        res.status(201).json(newSection);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.createSection = createSection;
// =========================
// Get All Sections
// =========================
const getAllSections = async (_req, res) => {
    try {
        const sections = await database_1.prisma.aboutPageSection.findMany({
            orderBy: { order: "asc" },
        });
        res.json(sections);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllSections = getAllSections;
// ==========================
// Get SectionBy ID
// ==========================
const getSectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const section = await database_1.prisma.aboutPageSection.findUnique({ where: { id } });
        if (!section) {
            res.status(404).json({ message: "Section not found" });
            return;
        }
        res.json(section);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getSectionById = getSectionById;
// ==========================
//  Update The Section
// ==========================
const updateSection = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { id } = req.params;
        const { title, content, order } = req.body;
        const updatedSection = await database_1.prisma.aboutPageSection.update({
            where: { id },
            data: { title, content, order },
        });
        res.json(updatedSection);
    }
    catch (err) {
        if (err.code === "P2025") {
            res.status(404).json({ message: "Section not found" });
        }
        else {
            res.status(500).json({ message: err.message });
        }
    }
};
exports.updateSection = updateSection;
// ============================
// Delete Section 
// ============================
const deleteSection = async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.prisma.aboutPageSection.delete({ where: { id } });
        res.json({ message: "Section deleted successfully" });
    }
    catch (err) {
        if (err.code === "P2025") {
            res.status(404).json({ message: "Section not found" });
        }
        else {
            res.status(500).json({ message: err.message });
        }
    }
};
exports.deleteSection = deleteSection;
//# sourceMappingURL=aboutPageSection.Controller.js.map
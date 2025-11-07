import { validationResult } from "express-validator";
import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { prisma } from "../config/database";
import { AboutSection } from "@prisma/client";

// =========================
// Create Section
// =========================
export const createSection = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { section, title, content, order } = req.body;

    const validSections = Object.values(AboutSection);
    if (!validSections.includes(section)) {
      res.status(400).json({ message: "Invalid section type" });
      return;
    }

    // Only check uniqueness for fixed sections
    if (section !== "CUSTOMIZ_SECTION") {
      const existingSection = await prisma.aboutPageSection.findFirst({
        where: { section },
      });
      if (existingSection) {
        res.status(400).json({ message: `Section "${section}" already exists.` });
        return;
      }
    }

    const newSection = await prisma.aboutPageSection.create({
      data: { section, title, content, order },
    });

    res.status(201).json(newSection);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// Get All Sections
// =========================

export const getAllSections = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sections = await prisma.aboutPageSection.findMany({
      orderBy: { order: "asc" },
    });
    res.json(sections);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// Get SectionBy ID
// ==========================
export const getSectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const section = await prisma.aboutPageSection.findUnique({ where: { id } });

    if (!section) {
      res.status(404).json({ message: "Section not found" });
      return;
    }

    res.json(section);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================
//  Update The Section
// ==========================
export const updateSection = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { id } = req.params;
    const { title, content, order } = req.body;

    const updatedSection = await prisma.aboutPageSection.update({
      where: { id },
      data: { title, content, order },
    });

    res.json(updatedSection);
  } catch (err: any) {
    if (err.code === "P2025") {
      res.status(404).json({ message: "Section not found" });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};


// ============================
// Delete Section 
// ============================
export const deleteSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.aboutPageSection.delete({ where: { id } });
    res.json({ message: "Section deleted successfully" });
  } catch (err: any) {
    if (err.code === "P2025") {
      res.status(404).json({ message: "Section not found" });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

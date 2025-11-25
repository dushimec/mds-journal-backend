import { Router, Request, Response } from "express";
import { prisma } from "../config/database";

export const generateCrudRoutes = (modelName: string) => {
  const router = Router();

  const prismaClient = prisma as any;

  if (!prismaClient[modelName]) {
    console.error(`❌ Prisma model "${modelName}" does NOT exist.`);
    throw new Error(`Model "${modelName}" not found in PrismaClient`);
  }

  router.post("/", async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const created = await prismaClient[modelName].create({ data });
      res.json({ success: true, data: created });
    } catch (err) {
      res.status(500).json({ success: false, error: err });
    }
  });


  router.get("/", async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const skip = Number(req.query.skip) || 0;

      const items = await prismaClient[modelName].findMany({
        take: limit,
        skip,
      });
      res.json({ success: true, data: items });
    } catch (err) {
      res.status(500).json({ success: false, error: err });
    }
  });


  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      const item = await prismaClient[modelName].findUnique({
        where: { id },
      });

      res.json({ success: true, data: item });
    } catch (err) {
      res.status(500).json({ success: false, error: err });
    }
  });


  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const data = req.body;

      const updated = await prismaClient[modelName].update({
        where: { id },
        data,
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: err });
    }
  });


  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      await prismaClient[modelName].delete({
        where: { id },
      });

      res.json({ success: true, message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, error: err });
    }
  });

  return router;
};



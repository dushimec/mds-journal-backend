import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../config/database";

/**
 * Generate BibTeX citation for an article
 */
export const getArticleBibtex = asyncHandler(async (req: Request, res: Response) => {
  const { volume, issue } = req.params;
  const slug = req.params[0];

  const submission = await prisma.submission.findFirst({
    where: {
      volume: parseInt(volume),
      issue: parseInt(issue),
      seoPdfName: slug,
      status: "PUBLISHED",
    },
    include: {
      authors: true,
      topic: true,
    },
  });

  if (!submission) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }

  // Generate BibTeX entry
  const firstAuthor = submission.authors[0]?.fullName.split(" ").pop() || "Unknown";
  const year = submission.publishedAt ? new Date(submission.publishedAt).getFullYear() : new Date().getFullYear();
  const month = submission.publishedAt 
    ? new Date(submission.publishedAt).toLocaleString("default", { month: "short" }).toLowerCase() 
    : "jan";

  const authorList = submission.authors
    .sort((a, b) => a.order - b.order)
    .map((a) => a.fullName)
    .join(" and ");

  const keywords = submission.keywords || "";
  const abstract = submission.abstract || "";
  const title = submission.manuscriptTitle || "";

  const bibtex = `@article{jaedp${firstAuthor}${year},
  author = {${authorList}},
  title = {${title}},
  journal = {JAEDP},
  year = {${year}},
  month = {${month}},
  volume = {${submission.volume || ""}},
  number = {${submission.issue || ""}},
  pages = {--},
  doi = {${submission.doiSlug || ""}},
  keywords = {${keywords}},
  abstract = {${abstract.substring(0, 500)}},
  url = {https://www.jaedp.org/vol${submission.volume}/issue${submission.issue}/${submission.seoPdfName}}
}`;

  res.setHeader("Content-Type", "application/x-bibtex");
  res.setHeader("Content-Disposition", `attachment; filename="${slug}.bib"`);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(bibtex);
});

/**
 * Generate RIS citation for an article
 */
export const getArticleRis = asyncHandler(async (req: Request, res: Response) => {
  const { volume, issue } = req.params;
  const slug = req.params[0];

  const submission = await prisma.submission.findFirst({
    where: {
      volume: parseInt(volume),
      issue: parseInt(issue),
      seoPdfName: slug,
      status: "PUBLISHED",
    },
    include: {
      authors: true,
    },
  });

  if (!submission) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }

  const year = submission.publishedAt ? new Date(submission.publishedAt).getFullYear() : new Date().getFullYear();
  const pubDate = submission.publishedAt ? new Date(submission.publishedAt).toISOString().split("T")[0] : "";
  const title = submission.manuscriptTitle || "";
  const abstract = (submission.abstract || "").substring(0, 2000);

  let ris = `TY  - JOUR
TI  - ${title.replace(/[{}]/g, "")}
AU  - ${submission.authors.map((a) => a.fullName).join("\nAU  - ")}
JO  - JAEDP
VL  - ${submission.volume || ""}
IS  - ${submission.issue || ""}
PY  - ${year}
DA  - ${pubDate}
AB  - ${abstract.replace(/[{}]/g, "")}
KW  - ${submission.keywords?.split(",").join("; ") || ""}
DO  - ${submission.doiSlug || ""}
UR  - https://www.jaedp.org/vol${submission.volume}/issue${submission.issue}/${submission.seoPdfName}
ER  -
`;

  res.setHeader("Content-Type", "application/x-research-info-systems");
  res.setHeader("Content-Disposition", `attachment; filename="${slug}.ris"`);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(ris);
});

/**
 * Get article citation in JSON format
 */
export const getArticleCitation = asyncHandler(async (req: Request, res: Response) => {
  const { volume, issue } = req.params;
  const slug = req.params[0];

  const submission = await prisma.submission.findFirst({
    where: {
      volume: parseInt(volume),
      issue: parseInt(issue),
      seoPdfName: slug,
      status: "PUBLISHED",
    },
    include: {
      authors: true,
    },
  });

  if (!submission) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }

  const year = submission.publishedAt ? new Date(submission.publishedAt).getFullYear() : new Date().getFullYear();
  const title = submission.manuscriptTitle || "";
  const authorsStr = submission.authors.map((a) => a.fullName).join(", ");

  res.json({
    success: true,
    data: {
      apa: `${authorsStr} (${year}). ${title}. JAEDP, ${submission.volume}(${submission.issue}). https://doi.org/${submission.doiSlug}`,
      mla: `${authorsStr}. "${title}." JAEDP, vol. ${submission.volume}, no. ${submission.issue}, ${year}.`,
      chicago: `${authorsStr}. "${title}." JAEDP ${submission.volume}, no. ${submission.issue} (${year}). https://doi.org/${submission.doiSlug}`,
      harvard: `${authorsStr} (${year}) '${title}', JAEDP, ${submission.volume}(${submission.issue}).`,
      bibtex: `${submission.authors[0]?.fullName.split(" ").pop() || "Unknown"}, ${year}`,
    },
  });
});

/**
 * Get article references (placeholder - would need PDF text extraction in production)
 */
export const getArticleReferences = asyncHandler(async (req: Request, res: Response) => {
  const { volume, issue } = req.params;
  const slug = req.params[0];

  const submission = await prisma.submission.findFirst({
    where: {
      volume: parseInt(volume),
      issue: parseInt(issue),
      seoPdfName: slug,
      status: "PUBLISHED",
    },
  });

  if (!submission) {
    return res.status(404).json({ success: false, message: "Article not found" });
  }

  res.json({
    success: true,
    data: {
      references: [],
    },
  });
});

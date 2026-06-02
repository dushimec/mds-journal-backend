import { Request, Response } from "express";
import { prisma } from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

// Default content
const DEFAULT_AUTHOR_PAGE = {
  title: "Author Guidelines",
  tagline: "Comprehensive guidelines for authors to prepare and submit high-quality manuscripts that meet our rigorous standards for scientific excellence.",
  submissionSteps: [
    {
      step: 1,
      title: "Prepare Manuscript",
      description: "Format your manuscript according to our guidelines",
      icon: "FileText",
    },
    {
      step: 2,
      title: "Online Submission",
      description: "Submit through our online portal with required documents",
      icon: "Upload",
    },
    {
      step: 3,
      title: "Initial Review",
      description: "Editorial team conducts initial quality assessment",
      icon: "CheckCircle",
    },
    {
      step: 4,
      title: "Peer Review",
      description: "Expert reviewers evaluate your research",
      icon: "Users",
    },
    {
      step: 5,
      title: "Decision & Revision",
      description: "Receive feedback and revise if required",
      icon: "MessageSquare",
    },
    {
      step: 6,
      title: "Publication",
      description: "Final acceptance and publication process",
      icon: "Award",
    },
  ],
  articleTypes: [
    {
      type: "Plagiarism Policy",
      description:
        "MDS-JAED enforces a strict plagiarism threshold of 15%. All manuscripts will be screened using Turnitin or equivalent software. Manuscripts with high similarity scores will be automatically rejected or returned for revision.",
      items: [],
    },
    {
      type: "Author Fees",
      description:
        "Currently, there are no submission or publication fees. This policy may be revised in the future to cover editorial and hosting costs.",
      items: [],
    },
    {
      type: "Types of Submissions",
      description: "",
      items: [
        "Original Research Article 4,000–8,000 words Full-length analytical papers",
        "Policy Brief 2,000–4,000 words: Short, actionable findings for decision-makers",
        "Field/Case Reports 3,000–6,000 words Field research, project evaluations",
        "Book Reviews 1,000–2,500 words: Reviews of recent academic publications",
      ],
      description2: "Accepted articles may be published online ahead of print.",
    },
    {
      type: "Publication Schedule",
      description: "MDS-JAED is published biannually:",
      items: ["Volume 1, Issue 1: July–December", "Volume 1, Issue 2: January–June"],
    },
    {
      type: "Acceptable Topics",
      description: "We accept manuscripts in areas including (but not limited to):",
      items: [
        "Development Economics and Sustainable Growth",
        "Applied Microeconomics and Macroeconomics",
        "Financial Inclusion and Sector Stability",
        "Public Finance and Fiscal Policy",
        "Agricultural and Rural Development",
        "Education, Economics, and Labor Markets",
        "Entrepreneurship and Innovation in Africa",
        "Economic Policy Analysis and Evaluation",
        "Environmental and Energy Economics",
        "Quantitative Modeling in Economics",
      ],
    },
    {
      type: "Formatting Guidelines",
      description: "Comprehensive Formatting Guidelines",
      items: [
        "Language: English (British or American, but consistent throughout)",
        "Citation Style: APA 7th Edition",
        "File Format: Submit both Word (.docx) and PDF (.pdf)",
        "Font: Times New Roman, 12 pt, 1.5 spacing",
        "Margins: Normal (1 inch)",
        "Page Numbers: Bottom right",
        "Tables and Figures: Embedded in the text with proper labels and sources",
      ],
    },
  ],
  guidelines: [
    {
      category: "Manuscript Format",
      items: [
        "Title page with author information and conflicts of interest",
        "Abstract (250-300 words) with keywords",
        "Introduction, Methods, Results, Discussion structure",
        "References in APA format (maximum 50 for research articles)",
        "Figures and tables with appropriate captions",
      ],
    },
    {
      category: "Requirements documents",
      items: [
        "Double-spaced text with 12pt Times New Roman font",
        "Line numbers and page numbers included",
        "High-resolution figures (minimum 300 DPI)",
        "Supplementary materials in separate files",
        "Manuscript file in .docx or .pdf format",
      ],
    },
    {
      category: "Ethical Standards",
      items: [
        "Ethics approval for human/animal research",
        "Informed consent documentation",
        "Declaration of competing interests",
        "Data availability statement",
        "Acknowledgment of funding sources",
      ],
    },
  ],
};

export class AuthorPageController {
  /**
   * Get author page content with defaults
   */
  static getAuthorPageContent = asyncHandler(async (req: Request, res: Response) => {
    let authorPage = await prisma.authorPage.findUnique({
      where: { id: "author-page" },
    });

    if (!authorPage) {
      // Return defaults if not found
      return res.json({
        success: true,
        data: {
          id: "author-page",
          ...DEFAULT_AUTHOR_PAGE,
          updatedAt: new Date(),
        },
      });
    }

    // Parse JSON strings to objects, fallback to defaults
    const parsedPage = {
      id: authorPage.id,
      title: authorPage.title || DEFAULT_AUTHOR_PAGE.title,
      tagline: authorPage.tagline || DEFAULT_AUTHOR_PAGE.tagline,
      submissionSteps: authorPage.submissionSteps
        ? JSON.parse(authorPage.submissionSteps)
        : DEFAULT_AUTHOR_PAGE.submissionSteps,
      articleTypes: authorPage.articleTypes
        ? JSON.parse(authorPage.articleTypes)
        : DEFAULT_AUTHOR_PAGE.articleTypes,
      guidelines: authorPage.guidelines
        ? JSON.parse(authorPage.guidelines)
        : DEFAULT_AUTHOR_PAGE.guidelines,
      updatedAt: authorPage.updatedAt,
    };

    res.json({
      success: true,
      data: parsedPage,
    });
  });

  /**
   * Update author page content (Admin only)
   */
  static updateAuthorPageContent = asyncHandler(async (req: Request, res: Response) => {
    const { title, tagline, submissionSteps, articleTypes, guidelines } = req.body;

    if (!title || !tagline) {
      throw new AppError("Title and tagline are required", 400);
    }

    const updated = await prisma.authorPage.upsert({
      where: { id: "author-page" },
      create: {
        id: "author-page",
        title,
        tagline,
        submissionSteps: submissionSteps ? JSON.stringify(submissionSteps) : null,
        articleTypes: articleTypes ? JSON.stringify(articleTypes) : null,
        guidelines: guidelines ? JSON.stringify(guidelines) : null,
      },
      update: {
        title,
        tagline,
        submissionSteps: submissionSteps ? JSON.stringify(submissionSteps) : null,
        articleTypes: articleTypes ? JSON.stringify(articleTypes) : null,
        guidelines: guidelines ? JSON.stringify(guidelines) : null,
      },
    });

    // Parse and return
    const parsedPage = {
      id: updated.id,
      title: updated.title,
      tagline: updated.tagline,
      submissionSteps: updated.submissionSteps ? JSON.parse(updated.submissionSteps) : DEFAULT_AUTHOR_PAGE.submissionSteps,
      articleTypes: updated.articleTypes ? JSON.parse(updated.articleTypes) : DEFAULT_AUTHOR_PAGE.articleTypes,
      guidelines: updated.guidelines ? JSON.parse(updated.guidelines) : DEFAULT_AUTHOR_PAGE.guidelines,
      updatedAt: updated.updatedAt,
    };

    res.json({
      success: true,
      message: "Author page content updated successfully",
      data: parsedPage,
    });
  });
}


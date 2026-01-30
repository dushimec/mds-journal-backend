import { prisma } from "../config/database";
import slugify from "slugify";

/**
 * DOI CONFIG
 */
const DOI_PREFIX = "10.9999"; // Replace later
const JOURNAL_CODE = "jaepd";

/* =====================================
   Build SEO PDF Filename
===================================== */
function buildSeoPdfName(
  doi: string,
  title?: string
): string {
  // 10.1234/mds.2026.15 → 10-1234-mds-2026-15
  const safeDoi = doi
    .replace(/\//g, "-")
    .replace(/\./g, "-");

  const safeTitle = title
    ? slugify(title, {
        lower: true,
        strict: true,
        trim: true
      })
    : "article";

  return `${safeDoi}-${safeTitle}.pdf`;
}

/* =====================================
   Generate DOI
===================================== */
export async function generateDoiSlug(
  submissionId: string
): Promise<{
  doiSlug: string;
  seoPdfName: string;
}> {

  return await prisma.$transaction(async (tx) => {

    /* -------------------------------
       1. Load submission
    -------------------------------- */
    const submission = await tx.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        manuscriptTitle: true,
        publishedAt: true,
        journalIssue: {
          select: { year: true }
        }
      }
    });

    if (!submission) {
      throw new Error("Submission not found");
    }

    /* -------------------------------
       2. Resolve year
    -------------------------------- */
    const year =
      submission.publishedAt?.getFullYear() ||
      submission.journalIssue?.year ||
      new Date().getFullYear();

    /* -------------------------------
       3. Find next available DOI number with collision handling
    -------------------------------- */
    let nextNumber = 1;
    let doiSlug = "";

    for (let i = 0; i < 50; i++) { // try 50 times max
      doiSlug = `${DOI_PREFIX}/${JOURNAL_CODE}.${year}.${nextNumber}`;

      // Only check other submissions, ignore current one
      const exists = await tx.submission.findFirst({
        where: { doiSlug, id: { not: submissionId } }
      });

      if (!exists) break; // No collision, safe to use
      nextNumber++;
    }

    if (!doiSlug) {
      throw new Error("Unable to generate unique DOI after 50 attempts");
    }

    /* -------------------------------
       4. Build SEO PDF filename
    -------------------------------- */
    const seoPdfName = buildSeoPdfName(
      doiSlug,
      submission.manuscriptTitle ?? undefined
    );

    return {
      doiSlug,
      seoPdfName
    };
  });
}

/* =====================================
   Assign DOI + SEO name to a submission
===================================== */
export async function assignDoiToSubmission(
  submissionId: string
): Promise<{
  doiSlug: string;
  seoPdfName: string;
}> {

  return await prisma.$transaction(async (tx) => {
    const { doiSlug, seoPdfName } = await generateDoiSlug(submissionId);

    await tx.submission.update({
      where: { id: submissionId },
      data: {
        doiSlug,
        seoPdfName
      }
    });

    return { doiSlug, seoPdfName };
  });
}

/* =====================================
   Generate Article Slug
   Example: 10-9999-jaepd-2026-5-my-article-title
===================================== */
export async function generateArticleSlug(
  submissionId: string
): Promise<string> {

  return await prisma.$transaction(async (tx) => {
    const submission = await tx.submission.findUnique({
      where: { id: submissionId },
      select: { manuscriptTitle: true, doiSlug: true }
    });

    if (!submission) throw new Error("Submission not found");
    if (!submission.doiSlug) throw new Error("DOI must be assigned first");

    const safeDoi = submission.doiSlug.replace(/\//g, "-").replace(/\./g, "-");

    const titleSlug = submission.manuscriptTitle
      ? slugify(submission.manuscriptTitle, { lower: true, strict: true, trim: true })
      : "article";

    let baseSlug = `${safeDoi}-${titleSlug}`;
    let finalSlug = baseSlug;

    // Ensure uniqueness
    for (let i = 1; i <= 50; i++) {
      const exists = await tx.submission.findFirst({
        where: { articleSlug: finalSlug, id: { not: submissionId } },
        select: { id: true }
      });
      if (!exists) break;
      finalSlug = `${baseSlug}-${i}`;
    }

    // Save to submission
    await tx.submission.update({
      where: { id: submissionId },
      data: { articleSlug: finalSlug }
    });

    return finalSlug;
  });
}

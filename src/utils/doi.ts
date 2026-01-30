import { prisma } from "../config/database";
import slugify from "slugify";

/**
 * DOI CONFIG
 */
const DOI_PREFIX = "10.9999"; // Replace with your actual DOI prefix
const JOURNAL_CODE = "jaepd";

/* =====================================
   Build SEO PDF Filename
===================================== */
function buildSeoPdfName(doi: string, title?: string): string {
  // Convert DOI to URL-safe
  const safeDoi = doi.replace(/\//g, "-").replace(/\./g, "-");

  const safeTitle = title
    ? slugify(title, { lower: true, strict: true, trim: true })
    : "article";

  return `${safeDoi}-${safeTitle}.pdf`;
}

/* =====================================
   Generate DOI Slug
===================================== */
export async function generateDoiSlug(submissionId: string): Promise<{ doiSlug: string; seoPdfName: string }> {
  return await prisma.$transaction(async (tx) => {
    // 1. Load submission
    const submission = await tx.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        manuscriptTitle: true,
        publishedAt: true,
        journalIssue: { select: { year: true } },
      },
    });

    if (!submission) throw new Error("Submission not found");

    // 2. Determine year
    const year = submission.publishedAt?.getFullYear() || submission.journalIssue?.year || new Date().getFullYear();

    // 3. Find last DOI in the same year
    const lastDoi = await tx.submission.findFirst({
      where: {
        status: "PUBLISHED",
        doiSlug: { startsWith: `${DOI_PREFIX}/${JOURNAL_CODE}.${year}.` },
      },
      orderBy: { createdAt: "desc" },
      select: { doiSlug: true },
    });

    // 4. Determine next number
    let nextNumber = 1;
    if (lastDoi?.doiSlug) {
      const parts = lastDoi.doiSlug.split(".");
      const lastNum = Number(parts.at(-1));
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    // 5. Build DOI
    const doiSlug = `${DOI_PREFIX}/${JOURNAL_CODE}.${year}.${nextNumber}`;

    // 6. Check collision
    const exists = await tx.submission.findFirst({ where: { doiSlug } });
    if (exists) throw new Error("DOI collision detected");

    // 7. Build SEO filename
    const seoPdfName = buildSeoPdfName(submission.manuscriptTitle ?? undefined, submission.manuscriptTitle);

    return { doiSlug, seoPdfName };
  });
}

/* =====================================
   Assign DOI + SEO filename to submission
===================================== */
export async function assignDoiToSubmission(submissionId: string): Promise<{ doiSlug: string; seoPdfName: string }> {
  return await prisma.$transaction(async (tx) => {
    const { doiSlug, seoPdfName } = await generateDoiSlug(submissionId);

    await tx.submission.update({
      where: { id: submissionId },
      data: { doiSlug, seoPdfName },
    });

    return { doiSlug, seoPdfName };
  });
}

/* =====================================
   Generate unique articleSlug
===================================== */
export async function generateArticleSlug(submissionId: string): Promise<string> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { manuscriptTitle: true, doiSlug: true },
  });

  if (!submission) throw new Error("Submission not found");
  if (!submission.manuscriptTitle || !submission.doiSlug)
    throw new Error("Submission must have DOI and title to generate articleSlug");

  // Convert DOI → URL safe
  const safeDoi = submission.doiSlug.replace(/\//g, "-").replace(/\./g, "-");

  // Slugify title
  const titleSlug = slugify(submission.manuscriptTitle, { lower: true, strict: true, trim: true });

  let baseSlug = `${safeDoi}-${titleSlug}`;
  let finalSlug = baseSlug;

  // Ensure uniqueness
  for (let i = 1; i <= 50; i++) {
    const exists = await prisma.submission.findFirst({
      where: { articleSlug: finalSlug },
      select: { id: true },
    });
    if (!exists) break;
    finalSlug = `${baseSlug}-${i}`;
  }

  return finalSlug;
}

import { prisma } from "../config/database";
import slugify from "slugify";

/**
 * DOI CONFIG
 */
const DOI_PREFIX = "10.1234"; // Replace later
const JOURNAL_CODE = "mds";


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
       3. Find last DOI
    -------------------------------- */
    const lastDoi = await tx.submission.findFirst({
      where: {
        status: "PUBLISHED",
        doiSlug: {
          startsWith: `${DOI_PREFIX}/${JOURNAL_CODE}.${year}.`
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        doiSlug: true
      }
    });


    /* -------------------------------
       4. Next number
    -------------------------------- */
    let nextNumber = 1;

    if (lastDoi?.doiSlug) {

      const parts = lastDoi.doiSlug.split(".");
      const lastNum = Number(parts.at(-1));

      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }


    /* -------------------------------
       5. Build DOI
    -------------------------------- */
    const doiSlug =
      `${DOI_PREFIX}/${JOURNAL_CODE}.${year}.${nextNumber}`;


    /* -------------------------------
       6. Build SEO filename
    -------------------------------- */
    const seoPdfName = buildSeoPdfName(
      doiSlug,
      submission.manuscriptTitle ?? undefined
    );


    /* -------------------------------
       7. Collision check
    -------------------------------- */
    const exists = await tx.submission.findFirst({
      where: { doiSlug }
    });

    if (exists) {
      throw new Error("DOI collision detected");
    }


    return {
      doiSlug,
      seoPdfName
    };
  });
}


/* =====================================
   Assign DOI + SEO name
===================================== */
export async function assignDoiToSubmission(
  submissionId: string
): Promise<{
  doiSlug: string;
  seoPdfName: string;
}> {

  return await prisma.$transaction(async (tx) => {

    const { doiSlug, seoPdfName } =
      await generateDoiSlug(submissionId);


    await tx.submission.update({
      where: { id: submissionId },
      data: {
        doiSlug,
        seoPdfName
      }
    });

    return {
      doiSlug,
      seoPdfName
    };
  });
}


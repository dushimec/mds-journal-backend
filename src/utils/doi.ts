import { prisma } from "../config/database";

/**
 * Generate a unique DOI slug for a submission
 * Format: 10.1234/mds.{year}.{sequential_number}
 * Where:
 * - 10.1234 is a placeholder DOI prefix (should be registered with a DOI agency)
 * - mds is the journal identifier
 * - {year} is the publication year
 * - {sequential_number} is a sequential number for that year
 */
export async function generateDoiSlug(submissionId: string): Promise<string> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { publishedAt: true, journalIssue: { select: { year: true } } }
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  const year = submission.publishedAt?.getFullYear() ||
              submission.journalIssue?.year ||
              new Date().getFullYear();

  // Get the count of published submissions for this year to create sequential number
  const publishedCount = await prisma.submission.count({
    where: {
      status: "PUBLISHED",
      publishedAt: {
        gte: new Date(year, 0, 1), // Start of year
        lt: new Date(year + 1, 0, 1) // Start of next year
      }
    }
  });

  // Sequential number starts from 1
  const sequentialNumber = publishedCount + 1;

  // Format: 10.1234/mds.{year}.{sequential_number}
  const doiSlug = `10.1234/mds.${year}.${sequentialNumber}`;

  // Ensure uniqueness (though the sequential approach should guarantee it)
  const existing = await prisma.submission.findUnique({
    where: { doiSlug },
    select: { id: true }
  });

  if (existing) {
    // If somehow there's a conflict, append a timestamp
    return `${doiSlug}.${Date.now()}`;
  }

  return doiSlug;
}

/**
 * Assign DOI to a submission when it's published
 */
export async function assignDoiToSubmission(submissionId: string): Promise<string> {
  const doiSlug = await generateDoiSlug(submissionId);

  await prisma.submission.update({
    where: { id: submissionId },
    data: { doiSlug }
  });

  return doiSlug;
}
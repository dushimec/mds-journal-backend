import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password1 = await bcrypt.hash("password123", 12);
  const password2 = await bcrypt.hash("alicepass123", 12);
  const password3 = await bcrypt.hash("johnpass123", 12);

  await prisma.contactInfo.upsert({
    where: { id: "default-contact" },
    update: {},
    create: {
      id: "default-contact",
      email: "journal@mdsconsultancy.org",
      phone: "+250 788255277",
      address: "Kigali, Rwanda",
    },
  });

  await prisma.page.createMany({
    data: [
      { slug: "about", title: "About Journal", content: "MDS Journal of Applied Economics and Development bridges research and practical applications in economics, entrepreneurship, and development with a focus on African contexts." },
      { slug: "history", title: "Our History", content: "The MDS Journal was established to provide a platform for sharing innovative research focused on Africa’s economic development." },
      { slug: "objectives", title: "Our Objectives", content: "To disseminate impactful research findings, connect academics with practitioners, and encourage interdisciplinary approaches in economics and development." },
      { slug: "team", title: "Our Team", content: "A dedicated team of editors, reviewers, and professionals committed to advancing knowledge and practice in applied economics and development." },
    ],
  });

  await prisma.editorialBoard.createMany({
    data: [
      { fullName: "Dr. Justin Rutikanga", title: "Doctor", levelOfEducation: "PhD in Economics", yearsOfExperience: 15, numberOfPublications: 25, position: "Chief Editor", bio: "Dr. Rutikanga leads the editorial team with expertise in applied economics and policy.", email: "justin.rutikanga@mdsconsultancy.org", photoUrl: null },
      { fullName: "Donald Masimbi", title: "MSc", levelOfEducation: "MSc Economics", yearsOfExperience: 10, numberOfPublications: 12, position: "Managing Editor", bio: "Donald Masimbi specializes in economic development and entrepreneurship in African contexts.", email: "donald.masimbi@mdsconsultancy.org", photoUrl: null },
      { fullName: "Prof. Alice Uwase", title: "Prof", levelOfEducation: "PhD in Development Studies", yearsOfExperience: 20, numberOfPublications: 40, position: "Editorial Board Member", bio: "Prof. Uwase focuses on sustainable economic growth and development policies.", email: "alice.uwase@mdsconsultancy.org", photoUrl: null },
    ],
  });

  await prisma.callForPaper.create({
    data: {
      title: "Call for Papers – Volume 1, Issue 1 (July-December 2025)",
      description: "The MDS Journal of Applied Economics and Development invites researchers and practitioners to submit their papers for the inaugural issue.",
      deadline: new Date("2025-09-30"),
    },
  });

  await prisma.user.createMany({
    data: [
      { name: "Research Team", email: "author@mdsconsultancy.org", password: password1, role: "AUTHOR" },
      { name: "Alice Niyonkuru", email: "alice@mdsconsultancy.org", password: password2, role: "AUTHOR" },
      { name: "John Mugisha", email: "john@mdsconsultancy.org", password: password3, role: "AUTHOR" },
    ],
    skipDuplicates: true,
  });

  const authorList = await prisma.user.findMany({ where: { role: "AUTHOR" } });

  await prisma.article.createMany({
    data: [
      {
        title: "Rwanda’s Innovative Policies for Sustainable Development",
        abstract: "An exploration of Rwanda’s economic policies and strategies for sustainability and resilience.",
        contentUrl: "https://journal.mdsconsultancy.org/sample-article.pdf",
        category: "Current Policy Issues",
        keywords: "Rwanda, Sustainable Development, Policy",
        status: "PUBLISHED",
        publishedAt: new Date("2025-07-19"),
        authorId: authorList[0].id,
      },
      {
        title: "Entrepreneurship and SMEs Growth in Africa",
        abstract: "Study of small and medium enterprises development and challenges in African economies.",
        contentUrl: "https://journal.mdsconsultancy.org/sample-article2.pdf",
        category: "Entrepreneurship",
        keywords: "SMEs, Africa, Business",
        status: "PUBLISHED",
        publishedAt: new Date("2025-08-10"),
        authorId: authorList[1].id,
      },
      {
        title: "The Role of Technology in Economic Development",
        abstract: "Impact of digital tools and technology adoption on economic growth in developing countries.",
        contentUrl: "https://journal.mdsconsultancy.org/sample-article3.pdf",
        category: "Development",
        keywords: "Technology, Digital, Development",
        status: "PUBLISHED",
        publishedAt: new Date("2025-09-05"),
        authorId: authorList[2].id,
      },
    ],
  });

  await prisma.submission.createMany({
    data: [
      {
        title: "New Trends in African Economies",
        abstract: "An academic study on emerging trends affecting economic growth in Africa.",
        fileUrl: "https://journal.mdsconsultancy.org/submissions/submission1.pdf",
        status: "SUBMITTED",
        authorId: authorList[0].id,
      },
      {
        title: "Impact of Policy on Rural Development",
        abstract: "Examining government policies and their effect on rural economic growth.",
        fileUrl: "https://journal.mdsconsultancy.org/submissions/submission2.pdf",
        status: "UNDER_REVIEW",
        authorId: authorList[1].id,
      },
      {
        title: "Innovation and Entrepreneurship",
        abstract: "Analysis of innovation strategies and entrepreneurship success in Africa.",
        fileUrl: "https://journal.mdsconsultancy.org/submissions/submission3.pdf",
        status: "ACCEPTED",
        authorId: authorList[2].id,
      },
    ],
  });
}

main()
  .then(async () => {
    console.log("✅ Database seeded successfully!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

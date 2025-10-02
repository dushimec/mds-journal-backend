import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding journal data with Users...');

  const password1 = await bcrypt.hash('password123', 10);
  const password2 = await bcrypt.hash('password123', 10);
  const password3 = await bcrypt.hash('password123', 10);

  // Users
  const user1 = await prisma.user.upsert({
    where: { email: 'sarah.chen@example.com' },
    update: {},
    create: {
      email: 'sarah.chen@example.com',
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'AUTHOR',
      affiliation: 'MIT',
      password: password1,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'michael.rodriguez@example.com' },
    update: {},
    create: {
      email: 'michael.rodriguez@example.com',
      firstName: 'Michael',
      lastName: 'Rodriguez',
      role: 'AUTHOR',
      affiliation: 'Stanford',
      password: password2,
    },
  });

  await prisma.user.upsert({
    where: { email: 'donald.masimbi@mds-consultancy.org' },
    update: {},
    create: {
      email: 'donald.masimbi@mds-consultancy.org',
      firstName: 'Donald',
      lastName: 'Masimbi',
      role: 'EDITOR',
      affiliation: 'Kibogora Polytechnic, Rwanda',
      password: password3,
    },
  });

  // Homepage
  await prisma.homePage.upsert({
    where: { id: 'homepage' },
    update: {},
    create: {
      id: 'homepage',
      title: 'MDS A Journal of Applied Economics and Development',
      tagline:
        'Bridging research and practical applications in economics, entrepreneurship, and development with a focus on African contexts.',
    },
  });

  // Articles
  await prisma.article.createMany({
    data: [
      {
        title: 'Advances in Quantum Computing Research',
        authors: 'Dr. Sarah Chen, Prof. Michael Rodriguez',
        abstract:
          'This comprehensive survey examines the intersection of quantum computing and machine learning...',
        publishedAt: new Date('2024-09-10'),
        category: 'Computer Science',
        keywords: 'Quantum Computing,Machine Learning',
        isHighlighted: true,
        order: 1,
      },
      {
        title: 'Climate Change Impact on Marine Ecosystems',
        authors: 'Dr. Emma Thompson, Dr. James Wilson',
        abstract: 'Through meta-analysis of 150+ studies...',
        publishedAt: new Date('2024-08-22'),
        category: 'Environmental Science',
        keywords: 'Climate Change,Biodiversity',
        isHighlighted: true,
        order: 2,
      },
      {
        title: 'Machine Learning in Medical Diagnosis',
        authors: 'Prof. David Kumar, Dr. Lisa Anderson',
        abstract:
          'Novel deep learning architectures demonstrate superior performance...',
        publishedAt: new Date('2024-08-05'),
        category: 'Medical Research',
        keywords: 'Medical Imaging,Deep Learning',
        isHighlighted: true,
        order: 3,
      },
    ],
    skipDuplicates: true,
  });

  // About Page Sections
  await prisma.aboutPageSection.createMany({
    data: [
      {
        section: 'HEADER',
        title: 'Empowering Knowledge Through Research',
        content:
          'MDS Journal of Applied Economics & Development (MDS-JAED)\n\nPublished by MDS Consultancy, Rwanda',
        order: 1,
      },
      {
        section: 'WHAT_IS_MDS_JAED',
        title: 'What is MDS-JAED?',
        content:
          'MDS-JAED is a biannual, peer-reviewed academic journal...',
        order: 2,
      },
    ],
    skipDuplicates: true,
  });

  // Editorial Board Members
  await prisma.editorialBoardMember.createMany({
    data: [
      {
        fullName: 'Donald Masimbi',
        role: 'Managing Editor',
        qualifications: 'MSc Econ',
        affiliation: 'Kibogora Polytechnic, Rwanda',
        bio: 'Donald Masimbi is an economist...',
        email: 'donald.masimbi@mds-consultancy.org',
        order: 1,
      },
      {
        fullName: 'Dr. Justin RUTIKANGA',
        role: 'Chief Editor',
        qualifications: 'PhD',
        affiliation: 'Senior Academic',
        bio: 'Dr. Justin RUTIKANGA is a respected scholar...',
        email: 'justin.rutikanga@mds-jaed.org',
        order: 2,
      },
    ],
    skipDuplicates: true,
  });

  // Contact Info
  await prisma.contactInfo.upsert({
    where: { id: 'contact' },
    update: {},
    create: {
      id: 'contact',
      intro: 'Get in touch with our editorial team...',
      editorEmail: 'editor@researchjournal.com',
      submissionsEmail: 'submissions@researchjournal.com',
      mailingAddress:
        'Research Journal Editorial Office\n123 Academic Plaza, Suite 400\nResearch City, RC 12345',
      officeHours:
        'Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 10:00 AM - 2:00 PM\nSunday: Closed',
      locationDescription: 'Located in the heart of the academic district...',
      social: {
        twitter: 'https://twitter.com/researchjournal',
        linkedin: 'https://linkedin.com/company/researchjournal',
        researchgate: 'https://researchgate.net/journal/researchjournal',
      },
    },
  });

  // FAQs
  await prisma.fAQ.createMany({
    data: [
      {
        question: 'How long does the review process take?',
        answer: 'The typical review process takes 8-12 weeks...',
        order: 1,
      },
    ],
    skipDuplicates: true,
  });

  // Journal Settings
  await prisma.journalSettings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      name: 'MDS A Journal of Applied Economics and Development',
      publisher: 'MDS Consultancy, Rwanda',
    },
  });

  // Submission Types
  await prisma.submissionType.createMany({
    data: [
      {
        name: 'Research Article',
        wordCount: '6000-8000',
        description: 'Full-length original research articles.',
        order: 1,
      },
      {
        name: 'Review Article',
        wordCount: '8000-10000',
        description: 'Comprehensive reviews of research literature.',
        order: 2,
      },
      {
        name: 'Case Study',
        wordCount: '3000-5000',
        description: 'Detailed reports of specific cases with analysis.',
        order: 3,
      },
      {
        name: 'Editorial',
        wordCount: '1000-2000',
        description: 'Editorial commentary on relevant issues.',
        order: 4,
      },
    ],
    skipDuplicates: true,
  });

  // Example Submission with Authors, Files, Declarations
  await prisma.submission.create({
    data: {
      status: 'SUBMITTED',
      manuscriptTitle: 'Advances in Quantum Computing Research',
      abstract: 'This survey explores recent advances in quantum algorithms...',
      category: 'Computer Science',
      keywords: 'Quantum Computing,Machine Learning',
      userId: user1.id,
      authors: {
        create: [
          {
            fullName: 'Dr. Sarah Chen',
            email: 'sarah.chen@example.com',
            affiliation: 'MIT',
            isCorresponding: true,
            order: 1,
            userId: user1.id,
          },
          {
            fullName: 'Prof. Michael Rodriguez',
            email: 'michael.rodriguez@example.com',
            affiliation: 'Stanford',
            order: 2,
            userId: user2.id,
          },
        ],
      },
      files: {
        create: [
          {
            fileName: 'manuscript.docx',
            fileType: 'MANUSCRIPT',
            fileUrl: 'https://example.com/files/manuscript.docx',
            fileSize: 12345678,
            mimeType:
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          },
          {
            fileName: 'cover_letter.pdf',
            fileType: 'COVER_LETTER',
            fileUrl: 'https://example.com/files/cover_letter.pdf',
            fileSize: 2345678,
            mimeType: 'application/pdf',
          },
        ],
      },
      declarations: {
        create: [
          {
            type: 'ETHICAL_CONDUCT',
            isChecked: true,
            text: 'I confirm this research was conducted ethically.',
          },
          {
            type: 'CONFLICT_OF_INTEREST',
            isChecked: true,
            text: 'I have disclosed all potential conflicts.',
          },
          {
            type: 'COPYRIGHT_TRANSFER',
            isChecked: true,
            text: 'I transfer copyright to the journal upon acceptance.',
          },
        ],
      },
    },
  });

  console.log('✅ Journal data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

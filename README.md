# MDS Journal Backend

## Overview

MDS Journal Backend is a robust backend application developed to support an academic journal management platform. The system provides secure APIs for managing journal articles, user interactions, document uploads, PDF downloads, and content administration.

Built using Node.js, TypeScript, Express, and Prisma ORM, the application follows the MVC (Model-View-Controller) architecture to ensure scalability, maintainability, and clean code organization.

---

## Features

### Authentication & Authorization

* Secure user authentication
* Role-based access control
* Password recovery functionality

### Article Management

* Create, update, and delete journal articles
* Manage article metadata and content
* Retrieve published articles

### File Management

* Upload journal documents
* Store and manage PDF files
* Download and view uploaded documents

### API Documentation

* Swagger API integration
* Well-documented endpoints for developers

### Testing & Quality Assurance

* Automated testing using Jest
* API validation and verification
* Continuous bug fixing and improvements

---

## Technologies Used

### Backend

* Node.js
* TypeScript
* Express.js

### Database

* PostgreSQL
* Prisma ORM

### Testing

* Jest
* Postman

### Development Tools

* Git
* GitHub
* Swagger

### Deployment

* Vercel

---

## Architecture

The project follows the MVC architecture:

```text
src/
├── controllers/
├── services/
├── routes/
├── middlewares/
├── prisma/
├── tests/
└── utils/
```

This structure promotes separation of concerns, maintainability, and scalability.

---

## My Contributions

As a Backend Developer, I contributed to:

* Implementing backend APIs using Express and TypeScript.
* Developing article management functionalities.
* Implementing file upload and PDF download features.
* Working with Prisma ORM for database operations.
* Debugging and resolving backend issues.
* Performing testing and validation using Jest.
* Collaborating with team members through GitHub workflows.
* Supporting deployment and production maintenance.

---

## Installation

### Clone Repository

```bash
git clone https://github.com/dushimec/mds-journal-backend.git
cd mds-journal-backend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file and configure:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

### Run Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build Application

```bash
npm run build
```

---

## API Testing

A Postman collection is included in the repository:

```text
postman_collection.json
```

Use it to test and validate API endpoints.

---

## Deployment

Production deployment is hosted on Vercel.

The project supports:

* Development Environment
* Preview Deployments
* Production Deployments

---

## Skills Demonstrated

* Node.js Development
* TypeScript Development
* Express.js Framework
* REST API Development
* Database Integration with Prisma
* PostgreSQL
* Software Testing with Jest
* API Documentation
* Git & GitHub Collaboration
* Debugging & Problem Solving
* Deployment & Maintenance

---

## Future Improvements

* Advanced analytics and reporting
* Enhanced search functionality
* Improved role management
* API performance optimization
* Additional automated test coverage

---

## Contributors

* Celie Nishimwe
* Chris Dushime
* Elisa

---

## License

This project was developed for educational and professional portfolio purposes.

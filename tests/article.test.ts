import request from "supertest";
import express from "express";
import articleRoutes from "../src/routers/article.routes";

// Mock the controller methods to avoid DB dependencies
jest.mock("../src/controllers/streamFile.controller", () => ({
    viewArticlePdf: jest.fn((req, res) => res.status(200).json({
        success: true,
        message: `View PDF: ${req.params.submissionId}`
    })),
    viewArticlePdfByPath: jest.fn((req, res) => res.status(200).json({
        success: true,
        message: `View PDF Path: ${req.params.path}`
    })),
    downloadArticlePdf: jest.fn((req, res) => res.status(200).json({
        success: true,
        message: `Download PDF: ${req.params.doi}`
    })),
}));

const app = express();
app.use(express.json());
app.use("/article", articleRoutes);

describe("Article Routes URL Matching", () => {

    it("should match view PDF route with submissionId", async () => {
        const submissionId = "some-submission-id";
        const response = await request(app).get(`/article/mds/${submissionId}/pdf`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(`View PDF: ${submissionId}`);
    });

    it("should match download PDF route with slashes in DOI", async () => {
        const doi = "10.1234/mds.2026.1";
        const response = await request(app).get(`/article/${doi}/download`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(`Download PDF: ${doi}`);
    });

    it("should match view PDF by path route with complex path", async () => {
        // Path: 10.1234/mds.2026.1.pdf
        // URL: /article/mds/article-pdf/10.1234/mds.2026.1.pdf
        const path = "10.1234/mds.2026.1.pdf";
        const response = await request(app).get(`/article/mds/article-pdf/${path}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(`View PDF Path: ${path}`);
    });
});

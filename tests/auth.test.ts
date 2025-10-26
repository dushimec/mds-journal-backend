import request from "supertest";
import { app } from "../src/server";
import { prisma } from "../src/config/database";

describe("Auth Routes", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /forgot-password", () => {
    it("should return 404 if user not found", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" });

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("User not found");
    });

    it("should return 200 and send a password reset email", async () => {
      const user = await prisma.user.create({
        data: {
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          password: "password",
        },
      });

      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Password reset link sent to your email.");

      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe("POST /reset-password", () => {
    it("should return 400 if token is invalid or expired", async () => {
      const res = await request(app).post("/api/auth/reset-password").send({
        token: "invalidtoken",
        password: "newpassword",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid or expired password reset token.");
    });
  });
});

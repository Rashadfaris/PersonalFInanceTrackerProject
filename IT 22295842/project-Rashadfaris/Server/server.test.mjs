import request from "supertest";
import app from "./index.js"; // Import your Express app

describe("GET /hello", () => {
    it("should return a JSON response with 'Hello, World!'", async () => {
        const response = await request(app).get("/hello");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Hello, World!" });
    });
});

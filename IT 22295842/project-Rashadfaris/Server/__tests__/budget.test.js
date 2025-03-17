import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import Budget from '../model/budget';

let mockToken;
let budgetId;

beforeAll(async () => {
    try {
        // Authenticate and obtain a valid JWT token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'it22295842@my.sliit.lk',
                password: 'pass',
            });

        mockToken = loginResponse.body.token;
        
        if (!mockToken) {
            throw new Error('Failed to get a valid token.');
        }

        // Create a budget entry for testing update and delete functionality
        const budgetResponse = await request(app)
            .post('/api/budget/create')
            .set('Authorization', `Bearer ${mockToken}`)
            .send({
                userId: '67cc10369e9ab0e4fc39cd09',
                category: 'Groceries',
                amount: 5000,  // Total budget amount
                month: 3,       // Month of budget
                year: 2025,     // Year of budget
                budgetType: 'monthly',
                spentAmount: 1000,  // Amount already spent
            });

        if (!budgetResponse.body.budget || !budgetResponse.body.budget._id) {
            throw new Error('Failed to create a test budget.');
        }

        budgetId = budgetResponse.body.budget._id; // Store budget ID for testing
    } catch (error) {
        console.error('Setup failed:', error.message);
    }
});

afterAll(async () => {
    try {
        // Cleanup: Delete the test budget and close the database connection
        if (budgetId) {
            await Budget.findByIdAndDelete(budgetId);
        }
        await mongoose.connection.close();
    } catch (error) {
        console.error('Cleanup failed:', error.message);
    }
});

describe('PATCH /api/budget/update/:budgetId', () => {
    test('should update the budget spentAmount', async () => {
        if (!budgetId) return;

        // Send a request to update the spentAmount of the budget
        const response = await request(app)
            .patch(`/api/budget/update/${budgetId}`)
            .set('Authorization', `Bearer ${mockToken}`)
            .send({ spentAmount: 2000 });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Budget updated successfully');

        // Verify the updated value in the database
        const updatedBudget = await Budget.findById(budgetId);
        expect(updatedBudget.spentAmount).toBe(2000);
    });
});

describe('DELETE /api/budget/delete/:budgetId', () => {
    test('should delete the budget', async () => {
        if (!budgetId) return;

        // Send a request to delete the budget
        const response = await request(app)
            .delete(`/api/budget/delete/${budgetId}`)
            .set('Authorization', `Bearer ${mockToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Budget deleted successfully.');

        // Verify the budget no longer exists in the database
        const deletedBudget = await Budget.findById(budgetId);
        expect(deletedBudget).toBeNull();
    });
});

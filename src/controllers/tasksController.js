const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: The task ID
 *         title:
 *           type: string
 *           description: The task title
 *           example: My first task
 *         description:
 *           type: string
 *           description: The task description
 *           example: This is a test task
 *         status:
 *           type: string
 *           enum: [Pending, InProgress, Completed, Cancelled]
 *           description: The task status
 *           example: Pending
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation timestamp
 *         userId:
 *           type: integer
 *           description: The ID of the user who created the task
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *                 description: The task title
 *               description:
 *                 type: string
 *                 description: The task description
 *               status:
 *                 type: string
 *                 enum: [Pending, InProgress, Completed, Cancelled]
 *                 description: The task status
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const createTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const userId = req.user.id; // From auth middleware

        // Validate status
        const validStatuses = ['Pending', 'InProgress', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Must be one of: Pending, InProgress, Completed, Cancelled' 
            });
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                status,
                createdAt: new Date(),
                userId
            }
        });

        console.log(`New task created with ID: ${task.id} by user: ${userId}`);
        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};

module.exports = {
    createTask
}; 
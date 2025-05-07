const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const taskController = {
    /**
     * @swagger
     * /tasks:
     *   get:
     *     summary: Get all tasks for current user
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [pending, in_progress, completed]
     *         description: Filter tasks by status
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search tasks by title or description
     *     responses:
     *       200:
     *         description: List of tasks
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: integer
     *                         example: 1
     *                       title:
     *                         type: string
     *                         example: "Complete project"
     *                       description:
     *                         type: string
     *                         example: "Finish the task management API"
     *                       status:
     *                         type: string
     *                         example: "in_progress"
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *       401:
     *         description: Unauthorized
     */
    async getTasks(req, res) {
        try {
            const userId = req.user.id;
            const { status, search } = req.query;

            const where = {
                userId,
                ...(status && { status }),
                ...(search && {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } }
                    ]
                })
            };

            const tasks = await prisma.task.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            });

            res.json({
                success: true,
                data: tasks
            });
        } catch (error) {
            console.error('Get tasks error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving tasks',
                error: error.message
            });
        }
    },

    /**
     * @swagger
     * /tasks/{id}:
     *   get:
     *     summary: Get specific task details
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Task ID
     *     responses:
     *       200:
     *         description: Task details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       example: 1
     *                     title:
     *                       type: string
     *                       example: "Complete project"
     *                     description:
     *                       type: string
     *                       example: "Finish the task management API"
     *                     status:
     *                       type: string
     *                       example: "in_progress"
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Task not found
     */
    async getTask(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const task = await prisma.task.findFirst({
                where: {
                    id: parseInt(id),
                    userId
                }
            });

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            res.json({
                success: true,
                data: task
            });
        } catch (error) {
            console.error('Get task error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving task',
                error: error.message
            });
        }
    },

    /**
     * @swagger
     * /tasks:
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
     *             properties:
     *               title:
     *                 type: string
     *                 example: "Complete project"
     *               description:
     *                 type: string
     *                 example: "Finish the task management API"
     *               status:
     *                 type: string
     *                 enum: [pending, in_progress, completed]
     *                 default: pending
     *                 example: "pending"
     *     responses:
     *       201:
     *         description: Task created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       example: 1
     *                     title:
     *                       type: string
     *                       example: "Complete project"
     *                     description:
     *                       type: string
     *                       example: "Finish the task management API"
     *                     status:
     *                       type: string
     *                       example: "pending"
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *       401:
     *         description: Unauthorized
     */
    async createTask(req, res) {
        try {
            const userId = req.user.id;
            const { title, description, status = 'pending' } = req.body;

            const task = await prisma.task.create({
                data: {
                    title,
                    description,
                    status,
                    userId
                }
            });

            res.status(201).json({
                success: true,
                data: task
            });
        } catch (error) {
            console.error('Create task error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating task',
                error: error.message
            });
        }
    }
};

module.exports = taskController; 
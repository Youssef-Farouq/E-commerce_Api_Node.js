const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @swagger
 * /items/list:
 *   get:
 *     summary: Get list of items
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter items by category
 *     responses:
 *       200:
 *         description: List of items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - example:
 *                     success: true
 *                     message: Items retrieved successfully
 *                     data: [
 *                       {
 *                         id: 1,
 *                         name: "Classic T-Shirt",
 *                         category: "Clothing",
 *                         cost: 29.99,
 *                         thumbnailUrl: "https://example.com/thumbnail.jpg"
 *                       }
 *                     ]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
const listItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const items = await prisma.item.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        category: true,
        cost: true,
        thumbnailUrl: true
      }
    });

    const total = await prisma.item.count();

    res.json({
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

/**
 * @swagger
 * /items/details/{id}:
 *   get:
 *     summary: Get detailed information about an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - example:
 *                     success: true
 *                     message: Item details retrieved successfully
 *                     data:
 *                       id: 1
 *                       name: "Classic T-Shirt"
 *                       category: "Clothing"
 *                       description: "A comfortable cotton t-shirt"
 *                       cost: 29.99
 *                       thumbnailUrl: "https://example.com/thumbnail.jpg"
 *                       imageUrl: "https://example.com/image.jpg"
 *                       size: "M"
 *                       color: "Blue"
 *       400:
 *         description: Invalid item ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
const getItemDetails = async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item details' });
  }
};

/**
 * @swagger
 * /items/search:
 *   post:
 *     summary: AI-powered search through items
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - prompt
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of item IDs to search through
 *                 example: [1, 2, 3]
 *               prompt:
 *                 type: string
 *                 description: Search criteria (e.g., "cheaper one" or "color blue")
 *                 example: "cheaper one"
 *     responses:
 *       200:
 *         description: Search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - example:
 *                     success: true
 *                     message: Search completed successfully
 *                     data:
 *                       id: 1
 *                       name: "Classic T-Shirt"
 *                       category: "Clothing"
 *                       description: "A comfortable cotton t-shirt"
 *                       cost: 29.99
 *                       thumbnailUrl: "https://example.com/thumbnail.jpg"
 *                       imageUrl: "https://example.com/image.jpg"
 *                       size: "M"
 *                       color: "Blue"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: No matching items found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
const aiSearch = async (req, res) => {
  try {
    const { items, prompt } = req.body;

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid items array' });
    }

    // Fetch items from database
    const dbItems = await prisma.item.findMany({
      where: {
        id: {
          in: items
        }
      }
    });

    // Simple comparison logic based on prompt keywords
    const results = dbItems.map(item => {
      let score = 0;
      
      // Check for price-related criteria
      if (prompt.toLowerCase().includes('cheaper') || prompt.toLowerCase().includes('lowest price')) {
        score -= item.cost;
      }
      if (prompt.toLowerCase().includes('expensive') || prompt.toLowerCase().includes('highest price')) {
        score += item.cost;
      }

      // Check for color availability
      if (item.color && prompt.toLowerCase().includes(item.color.toLowerCase())) {
        score += 10;
      }

      // Check for size availability
      if (item.size && prompt.toLowerCase().includes(item.size.toLowerCase())) {
        score += 10;
      }

      return {
        ...item,
        relevanceScore: score
      };
    });

    // Sort results by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({
      results,
      prompt,
      totalItems: results.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process AI search' });
  }
};

module.exports = {
  listItems,
  getItemDetails,
  aiSearch
}; 
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
    const { category } = req.query;
    
    const items = await prisma.item.findMany({
      where: category ? { category } : undefined,
      select: {
        id: true,
        name: true,
        category: true,
        cost: true,
        thumbnailUrl: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      message: 'Items retrieved successfully',
      data: items
    });
  } catch (error) {
    console.error('Error listing items:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching items',
      error: error.message 
    });
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
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }

    const item = await prisma.item.findUnique({
      where: { id: parseInt(id) }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item details retrieved successfully',
      data: item
    });
  } catch (error) {
    console.error('Error fetching item details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching item details',
      error: error.message
    });
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

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required and must not be empty'
      });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search prompt is required'
      });
    }

    // Fetch all items from the database
    const dbItems = await prisma.item.findMany({
      where: {
        id: {
          in: items
        }
      }
    });

    if (dbItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No items found with the provided IDs'
      });
    }

    // Simple comparison logic based on prompt
    let result;
    if (prompt.toLowerCase().includes('cheaper')) {
      result = dbItems.reduce((prev, current) => 
        prev.cost < current.cost ? prev : current
      );
    } else if (prompt.toLowerCase().includes('color')) {
      const colorMatch = prompt.match(/color\s+(\w+)/i);
      if (colorMatch) {
        const targetColor = colorMatch[1].toLowerCase();
        result = dbItems.find(item => 
          item.color && item.color.toLowerCase() === targetColor
        );
      }
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No matching items found for the given criteria'
      });
    }

    res.json({
      success: true,
      message: 'Search completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in AI search:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing AI search',
      error: error.message
    });
  }
};

module.exports = {
  listItems,
  getItemDetails,
  aiSearch
}; 
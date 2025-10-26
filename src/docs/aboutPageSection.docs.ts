
/**
 * @swagger
 * tags:
 *   name: About Page Sections
 *   description: API for managing about page sections
 */

/**
 * @swagger
 * /about-sections:
 *   post:
 *     summary: Create a new about page section
 *     tags: [About Page Sections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - section
 *               - title
 *               - content
 *               - order
 *             properties:
 *               section:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: The created section
 *       400:
 *         description: Validation error or section already exists
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *   get:
 *     summary: Get all about page sections
 *     tags: [About Page Sections]
 *     responses:
 *       200:
 *         description: A list of about page sections
 */

/**
 * @swagger
 * /about-sections/{id}:
 *   get:
 *     summary: Get an about page section by ID
 *     tags: [About Page Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The section ID
 *     responses:
 *       200:
 *         description: The section
 *       404:
 *         description: Section not found
 *   put:
 *     summary: Update an about page section by ID
 *     tags: [About Page Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The section ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The updated section
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Section not found
 *   delete:
 *     summary: Delete an about page section by ID
 *     tags: [About Page Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The section ID
 *     responses:
 *       200:
 *         description: Section deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Section not found
 */


/**
 * @swagger
 * tags:
 *   name: Author Guidelines
 *   description: API for managing author guidelines
 */

/**
 * @swagger
 * /author-guidelines:
 *   post:
 *     summary: Create a new author guideline
 *     tags: [Author Guidelines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - content
 *               - order
 *             properties:
 *               type:
 *                 $ref: '#/components/schemas/AuthorGuidelineType'
 *               content:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: The created author guideline
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       409:
 *         description: Guideline with this type or order already exists
 *   get:
 *     summary: Get all author guidelines
 *     tags: [Author Guidelines]
 *     responses:
 *       200:
 *         description: A list of author guidelines
 */

/**
 * @swagger
 * /author-guidelines/stats:
 *   get:
 *     summary: Get author guideline statistics
 *     tags: [Author Guidelines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Author guideline statistics
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /author-guidelines/{type}:
 *   get:
 *     summary: Get an author guideline by type
 *     tags: [Author Guidelines]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/AuthorGuidelineType'
 *         description: The guideline type
 *     responses:
 *       200:
 *         description: The author guideline
 *       404:
 *         description: Guideline not found
 */

/**
 * @swagger
 * /author-guidelines/{id}:
 *   put:
 *     summary: Update an author guideline by ID
 *     tags: [Author Guidelines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The guideline ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 $ref: '#/components/schemas/AuthorGuidelineType'
 *               content:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The updated author guideline
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Guideline not found
 *   delete:
 *     summary: Delete an author guideline by ID
 *     tags: [Author Guidelines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The guideline ID
 *     responses:
 *       204:
 *         description: Guideline deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Guideline not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthorGuidelineType:
 *       type: string
 *       enum:
 *         - STYLE_AND_FORMATTING
 *         - CONTENT_AND_STRUCTURE
 *         - SUBMISSION_PROCESS
 */

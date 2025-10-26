
/**
 * @swagger
 * tags:
 *   name: Journal Issues
 *   description: API for managing journal issues
 */

/**
 * @swagger
 * /journal-issues:
 *   get:
 *     summary: Get all journal issues
 *     tags: [Journal Issues]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of items to return
 *     responses:
 *       200:
 *         description: A list of journal issues
 *   post:
 *     summary: Create a new journal issue
 *     tags: [Journal Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JournalIssueInput'
 *     responses:
 *       201:
 *         description: The created journal issue
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /journal-issues/stats:
 *   get:
 *     summary: Get statistics about journal issues
 *     tags: [Journal Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Journal issue statistics
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /journal-issues/{id}:
 *   get:
 *     summary: Get a journal issue by ID
 *     tags: [Journal Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The journal issue ID
 *     responses:
 *       200:
 *         description: The journal issue
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Journal issue not found
 *   patch:
 *     summary: Update a journal issue by ID
 *     tags: [Journal Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The journal issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JournalIssueInput'
 *     responses:
 *       200:
 *         description: The updated journal issue
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Journal issue not found
 *   delete:
 *     summary: Delete a journal issue by ID
 *     tags: [Journal Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The journal issue ID
 *     responses:
 *       204:
 *         description: Journal issue deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Journal issue not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     JournalIssue:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         year:
 *           type: integer
 *         volume:
 *           type: integer
 *         description:
 *           type: string
 *         isSpecial:
 *           type: boolean
 *         articleCount:
 *           type: integer
 *         submissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Submission'
 *     JournalIssueInput:
 *       type: object
 *       required:
 *         - title
 *         - year
 *         - volume
 *         - description
 *       properties:
 *         title:
 *           type: string
 *         year:
 *           type: integer
 *         volume:
 *           type: integer
 *         description:
 *           type: string
 *         isSpecial:
 *           type: boolean
 */

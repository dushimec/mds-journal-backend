
/**
 * @swagger
 * tags:
 *   name: Editorial Board
 *   description: API for managing editorial board members
 */

/**
 * @swagger
 * /editorial-board:
 *   get:
 *     summary: Get all editorial board members
 *     tags: [Editorial Board]
 *     responses:
 *       200:
 *         description: A list of editorial board members
 *   post:
 *     summary: Create a new editorial board member
 *     tags: [Editorial Board]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - role
 *               - qualifications
 *               - affiliation
 *               - bio
 *               - email
 *               - order
 *               - isActive
 *             properties:
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *               qualifications:
 *                 type: string
 *               affiliation:
 *                 type: string
 *               bio:
 *                 type: string
 *               email:
 *                 type: string
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: The created editorial board member
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /editorial-board/{id}:
 *   get:
 *     summary: Get an editorial board member by ID
 *     tags: [Editorial Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The member ID
 *     responses:
 *       200:
 *         description: The editorial board member
 *       404:
 *         description: Member not found
 *   put:
 *     summary: Update an editorial board member by ID
 *     tags: [Editorial Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The member ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *               qualifications:
 *                 type: string
 *               affiliation:
 *                 type: string
 *               bio:
 *                 type: string
 *               email:
 *                 type: string
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The updated editorial board member
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Member not found
 *   delete:
 *     summary: Delete an editorial board member by ID
 *     tags: [Editorial Board]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The member ID
 *     responses:
 *       200:
 *         description: Member deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Member not found
 */

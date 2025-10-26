
/**
 * @swagger
 * tags:
 *   name: Contact Messages
 *   description: API for managing contact messages
 */

/**
 * @swagger
 * /contact-messages:
 *   post:
 *     summary: Create a new contact message
 *     tags: [Contact Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactMessage'
 *     responses:
 *       201:
 *         description: The created contact message
 *       400:
 *         description: Validation error
 *   get:
 *     summary: Get all contact messages
 *     tags: [Contact Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of contact messages
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /contact-messages/{id}:
 *   get:
 *     summary: Get a contact message by ID
 *     tags: [Contact Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The message ID
 *     responses:
 *       200:
 *         description: The contact message
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Message not found
 *   patch:
 *     summary: Update a contact message by ID
 *     tags: [Contact Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isRead:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The updated contact message
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Message not found
 *   delete:
 *     summary: Delete a contact message by ID
 *     tags: [Contact Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The message ID
 *     responses:
 *       204:
 *         description: Message deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Message not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactMessage:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - inquiryType
 *         - subject
 *         - message
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         institution:
 *           type: string
 *         inquiryType:
 *           $ref: '#/components/schemas/InquiryType'
 *         subject:
 *           type: string
 *         message:
 *           type: string
 *     InquiryType:
 *       type: string
 *       enum:
 *         - GENERAL_INQUIRY
 *         - SUBMISSION_INQUIRY
 *         - TECHNICAL_SUPPORT
 *         - OTHER
 */

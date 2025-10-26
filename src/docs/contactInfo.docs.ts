
/**
 * @swagger
 * tags:
 *   name: Contact Information
 *   description: API for managing contact information
 */

/**
 * @swagger
 * /contact-info:
 *   post:
 *     summary: Create contact information
 *     tags: [Contact Information]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactInfo'
 *     responses:
 *       201:
 *         description: Contact information created successfully
 *       400:
 *         description: Validation error or contact information already exists
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *   get:
 *     summary: Get contact information
 *     tags: [Contact Information]
 *     responses:
 *       200:
 *         description: The contact information
 *       404:
 *         description: Contact information not found
 *   patch:
 *     summary: Update contact information
 *     tags: [Contact Information]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactInfo'
 *     responses:
 *       200:
 *         description: Contact information updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Contact information not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactInfo:
 *       type: object
 *       properties:
 *         intro:
 *           type: string
 *         editorEmail:
 *           type: string
 *         submissionsEmail:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         mailingAddress:
 *           type: string
 *         officeHours:
 *           type: string
 *         locationDescription:
 *           type: string
 *         social:
 *           type: object
 *           properties:
 *             twitter:
 *               type: string
 *             facebook:
 *               type: string
 *             linkedin:
 *               type: string
 */


/**
 * @swagger
 * tags:
 *   name: Home Page
 *   description: API for retrieving data for the home page
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get data for the home page
 *     tags: [Home Page]
 *     responses:
 *       200:
 *         description: Data for the home page
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HomePageData'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     HomePageData:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             recentSubmissions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Submission'
 *             publishedSubmissions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Submission'
 *             submissionStats:
 *               $ref: '#/components/schemas/SubmissionStats'
 *     Submission:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         abstract:
 *           type: string
 *         keywords:
 *           type: string
 *         status:
 *           $ref: '#/components/schemas/SubmissionStatus'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         topic:
 *           $ref: '#/components/schemas/Topic'
 *         user:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *     SubmissionStatus:
 *       type: string
 *       enum:
 *         - PENDING
 *         - IN_REVIEW
 *         - REJECTED
 *         - PUBLISHED
 *     Topic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *     SubmissionStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         byStatus:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/SubmissionStatus'
 *               count:
 *                 type: integer
 */

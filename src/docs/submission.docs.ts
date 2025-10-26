
/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: API for managing submissions
 */

/**
 * @swagger
 * /submissions/upload-single:
 *   post:
 *     summary: Upload a single file
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /submissions/upload-multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *       400:
 *         description: No files uploaded
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /submissions/stats:
 *   get:
 *     summary: Get submission statistics
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Submission statistics
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /submissions/download/{fileId}:
 *   get:
 *     summary: Download a file
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The file ID
 *     responses:
 *       200:
 *         description: The file to download
 *       404:
 *         description: File not found
 */

/**
 * @swagger
 * /submissions:
 *   post:
 *     summary: Create a new submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmissionInput'
 *     responses:
 *       201:
 *         description: The created submission
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *   get:
 *     summary: Get all submissions
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
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
 *         description: A list of submissions
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /submissions/{id}:
 *   get:
 *     summary: Get a submission by ID
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The submission ID
 *     responses:
 *       200:
 *         description: The submission
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Submission not found
 *   patch:
 *     summary: Update a submission by ID
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmissionInput'
 *     responses:
 *       200:
 *         description: The updated submission
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Submission not found
 *   delete:
 *     summary: Delete a submission by ID
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The submission ID
 *     responses:
 *       200:
 *         description: Submission deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Submission not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Submission:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         manuscriptTitle:
 *           type: string
 *         abstract:
 *           type: string
 *         keywords:
 *           type: string
 *         status:
 *           $ref: '#/components/schemas/SubmissionStatus'
 *         authors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Author'
 *         files:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FileUpload'
 *         declarations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Declaration'
 *         user:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *         topic:
 *           $ref: '#/components/schemas/Topic'
 *     SubmissionInput:
 *       type: object
 *       required:
 *         - manuscriptTitle
 *         - abstract
 *         - topicId
 *         - keywords
 *         - authors
 *         - files
 *         - declarations
 *       properties:
 *         manuscriptTitle:
 *           type: string
 *         abstract:
 *           type: string
 *         topicId:
 *           type: string
 *         keywords:
 *           type: string
 *         authors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Author'
 *         files:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FileUpload'
 *         declarations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Declaration'
 *     Author:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - affiliation
 *       properties:
 *         fullName:
 *           type: string
 *         email:
 *           type: string
 *         affiliation:
 *           type: string
 *         isCorresponding:
 *           type: boolean
 *         order:
 *           type: integer
 *     FileUpload:
 *       type: object
 *       required:
 *         - fileName
 *         - fileUrl
 *         - fileType
 *         - mimeType
 *         - fileSize
 *       properties:
 *         fileName:
 *           type: string
 *         fileUrl:
 *           type: string
 *         fileType:
 *           type: string
 *         mimeType:
 *           type: string
 *         fileSize:
 *           type: integer
 *     Declaration:
 *       type: object
 *       required:
 *         - type
 *         - isChecked
 *         - text
 *       properties:
 *         type:
 *           type: string
 *         isChecked:
 *           type: boolean
 *         text:
 *           type: string
 */

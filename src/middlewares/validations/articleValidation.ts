
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validate';

export const createArticleValidation = [
    body('title').isString().notEmpty(),
    body('authors').isString().notEmpty(),
    body('abstract').isString().notEmpty(),
    body('publishedAt').isISO8601().toDate(),
    body('keywords').isString().notEmpty(),
    body('isHighlighted').isBoolean().optional(),
    body('order').isInt().optional(),
    body('topicId').isString().optional(),
    body('issueId').isString().optional(),
];

export const updateArticleValidation = [
    param('id').isMongoId(),
    body('title').isString().optional(),
    body('authors').isString().optional(),
    body('abstract').isString().optional(),
    body('publishedAt').isISO8601().toDate().optional(),
    body('keywords').isString().optional(),
    body('isHighlighted').isBoolean().optional(),
    body('order').isInt().optional(),
    body('topicId').isString().optional(),
    body('issueId').isString().optional(),
];

export const deleteArticleValidation = [
    param('id').isMongoId(),
];

export const getAllArticlesValidation = [];

export const getByIdArticleValidation = [
    param('id').isMongoId(),
];

export const createIssueValidation = [
    body('name').isString().notEmpty(),
    body('issueDate').isISO8601().toDate(),
];

export const bulkDeleteArticlesValidation = [
    body('articleIds').isArray().notEmpty(),
    body('articleIds.*').isMongoId(),
];

export const incrementViewsValidation = [
    param('id').isMongoId(),
];

export const incrementDownloadsValidation = [
    param('id').isMongoId(),
];

export const getIssueStatsValidation = [
    param('issueId').isMongoId(),
];

export { validate };

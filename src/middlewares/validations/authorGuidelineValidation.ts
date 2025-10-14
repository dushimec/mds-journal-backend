
import { param, body } from 'express-validator';
import { AuthorGuidelineType } from '@prisma/client';

export const createAuthorGuidelineValidator = [
  body('type').isIn(Object.values(AuthorGuidelineType)).withMessage('Invalid guideline type'),
  body('content').isString().notEmpty().withMessage('Content is required'),
  body('order').isInt({ gt: 0 }).withMessage('Order must be a positive integer'),
];

export const updateAuthorGuidelineValidator = [
  param('id').isString().notEmpty().withMessage('Guideline ID is required'),
  body('type').optional().isIn(Object.values(AuthorGuidelineType)).withMessage('Invalid guideline type'),
  body('content').optional().isString().notEmpty().withMessage('Content cannot be empty'),
  body('order').optional().isInt({ gt: 0 }).withMessage('Order must be a positive integer'),
];

export const getAuthorGuidelineByTypeValidator = [
  param('type').isIn(Object.values(AuthorGuidelineType)).withMessage('Invalid guideline type'),
];

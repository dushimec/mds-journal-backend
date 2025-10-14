
import { body, param } from 'express-validator';

export const sendNewsletterValidation = [
  body('title').isString().notEmpty().withMessage('Title is required'),
  body('content').isString().notEmpty().withMessage('Content is required'),
];

export const getNewsletterByIdValidation = [
  param('id').isMongoId().withMessage('Invalid newsletter ID'),
];

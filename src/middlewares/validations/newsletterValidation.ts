
import { body } from 'express-validator';

export const sendNewsletterValidation = [
  body('title').isString().notEmpty().withMessage('Title is required'),
  body('content').isString().notEmpty().withMessage('Content is required'),
];

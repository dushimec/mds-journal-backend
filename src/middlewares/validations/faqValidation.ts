
import { body } from 'express-validator';

export const createFaqValidation = [
  body('question').isString().notEmpty().withMessage('Question is required'),
  body('answer').isString().notEmpty().withMessage('Answer is required'),
  body('order').optional().isInt(),
];

export const updateFaqValidation = [
  body('question').optional().isString(),
  body('answer').optional().isString(),
  body('order').optional().isInt(),
  body('isActive').optional().isBoolean(),
];

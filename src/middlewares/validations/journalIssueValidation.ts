
import { body } from 'express-validator';
import { validate } from '../validate';

export const journalIssueValidationRules = [
  body('issueNumber').notEmpty().withMessage('Issue number is required').isInt(),
  body('year').notEmpty().withMessage('Year is required').isInt(),
  body('month').optional().isInt(),
  body('title').notEmpty().withMessage('Title is required').isString(),
  body('isSpecial').optional().isBoolean(),
  body('specialTitle').optional().isString(),
  body('guestEditors').optional().isString(),
  validate,
];

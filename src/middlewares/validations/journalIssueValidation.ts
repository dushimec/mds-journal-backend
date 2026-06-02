
import { body } from 'express-validator';
import { validate } from '../validate';

export const journalIssueValidationRules = [
  body('volume').notEmpty().withMessage('Volume is required').isInt().withMessage('Volume must be an integer'),
  body('issue').notEmpty().withMessage('Issue is required').isInt().withMessage('Issue must be an integer'),
  body('year').notEmpty().withMessage('Year is required').isInt().withMessage('Year must be an integer'),
  validate,
];

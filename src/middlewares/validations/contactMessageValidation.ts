
import { body } from 'express-validator';

export const createContactMessageValidation = [
  body('firstName').isString().notEmpty().withMessage('First name is required'),
  body('lastName').isString().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('institution').optional().isString(),
  body('inquiryType').isString().notEmpty().withMessage('Inquiry type is required'),
  body('subject').isString().notEmpty().withMessage('Subject is required'),
  body('message').isString().notEmpty().withMessage('Message is required'),
];


import { body } from 'express-validator';

export const createContactInfoValidation = [
  body('intro').notEmpty().isString(),
  body('editorEmail').notEmpty().isEmail(),
  body('submissionsEmail').notEmpty().isEmail(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('mailingAddress').notEmpty().isString(),
  body('officeHours').notEmpty().isString(),
  body('locationDescription').notEmpty().isString(),
  body('social').optional().isObject(),
];

export const updateContactInfoValidation = [
  body('intro').optional().isString(),
  body('editorEmail').optional().isEmail(),
  body('submissionsEmail').optional().isEmail(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('mailingAddress').optional().isString(),
  body('officeHours').optional().isString(),
  body('locationDescription').optional().isString(),
  body('social').optional().isObject(),
];

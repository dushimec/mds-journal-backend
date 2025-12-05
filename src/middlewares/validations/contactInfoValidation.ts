
import { body } from 'express-validator';

export const createContactInfoValidation = [
  body('intro').notEmpty().isString(),
  body('editorEmail').notEmpty().isEmail(),
  body('submissionsEmail').notEmpty().isEmail(),
  body('email').optional({ nullable: true }).isEmail(),
  body('phone').optional({ nullable: true }).isString(),
  body('mailingAddress').notEmpty().isString(),
  body('officeHours').notEmpty().isString(),
  body('locationDescription').notEmpty().isString(),
  body('social').optional({ nullable: true }).isObject(),
];

export const updateContactInfoValidation = [
  body('intro').optional().isString(),
  body('editorEmail').optional({ nullable: true }).isEmail(),
  body('submissionsEmail').optional({ nullable: true }).isEmail(),
  body('email').optional({ nullable: true }).isEmail(),
  body('phone').optional({ nullable: true }).isString(),
  body('mailingAddress').optional({ nullable: true }).isString(),
  body('officeHours').optional({ nullable: true }).isString(),
  body('locationDescription').optional({ nullable: true }).isString(),
  body('social').optional({ nullable: true }).isObject(),
];

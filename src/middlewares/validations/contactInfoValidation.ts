
import { body } from 'express-validator';

export const updateContactInfoValidation = [
  body('intro').optional().isString(),
  body('editorEmail').optional().isEmail(),
  body('submissionsEmail').optional().isEmail(),
  body('mailingAddress').optional().isString(),
  body('officeHours').optional().isString(),
  body('locationDescription').optional().isString(),
  body('social').optional().isObject(),
];

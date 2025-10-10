
import { body } from 'express-validator';

export const subscribeValidation = [body('email').isEmail().withMessage('A valid email is required')];

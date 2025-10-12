
import { Router } from 'express';
import contactInfoController from '../controllers/contactInfo.controller';
import {
  createContactInfoValidation,
  updateContactInfoValidation,
} from '../middlewares/validations/contactInfoValidation';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  createContactInfoValidation,
  validate,
  contactInfoController.createContactInfo
);

router.get('/', contactInfoController.getContactInfo);
router.patch(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  updateContactInfoValidation,
  validate,
  contactInfoController.updateContactInfo
);

export default router;

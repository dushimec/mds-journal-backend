
import { Router } from 'express';
import faqController from '../controllers/faq.controller';
import { createFaqValidation, updateFaqValidation } from '../middlewares/validations/faqValidation';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.get('/', faqController.getAllFaqs);
router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  createFaqValidation,
  validate,
  faqController.createFaq
);

router.get('/:id', authenticate, authorizeRoles(UserRole.ADMIN), faqController.getFaqById);
router.patch(
  '/:id',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  updateFaqValidation,
  validate,
  faqController.updateFaq
);
router.delete('/:id', authenticate, authorizeRoles(UserRole.ADMIN), faqController.deleteFaq);

export default router;

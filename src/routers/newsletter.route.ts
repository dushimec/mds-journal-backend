
import { Router } from 'express';
import newsletterController from '../controllers/newsletter.controller';
import newsletterSubscriberController from '../controllers/newsletterSubscriber.controller';
import { sendNewsletterValidation } from '../middlewares/validations/newsletterValidation';
import { subscribeValidation as subscribeNewsletterValidation } from '../middlewares/validations/newsletterSubscriberValidation';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.post(
  '/send',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  sendNewsletterValidation,
  validate,
  newsletterController.sendNewsletter
);

router.post(
  '/subscribe',
  subscribeNewsletterValidation,
  validate,
  newsletterSubscriberController.subscribe
);

router.get(
    '/subscribers',
    authenticate,
    authorizeRoles(UserRole.ADMIN),
    newsletterSubscriberController.getAllSubscribers
);

export default router;

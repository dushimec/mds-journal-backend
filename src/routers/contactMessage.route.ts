
import { Router } from 'express';
import contactMessageController from '../controllers/contactMessage.controller';
import { createContactMessageValidation } from '../middlewares/validations/contactMessageValidation';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.post('/', createContactMessageValidation, validate, contactMessageController.createContactMessage);
router.get('/', authenticate, authorizeRoles(UserRole.ADMIN), contactMessageController.getAllContactMessages);
router.get('/:id', authenticate, authorizeRoles(UserRole.ADMIN), contactMessageController.getContactMessageById);
router.patch('/:id', authenticate, authorizeRoles(UserRole.ADMIN), contactMessageController.updateContactMessage);
router.delete('/:id', authenticate, authorizeRoles(UserRole.ADMIN), contactMessageController.deleteContactMessage);

export default router;

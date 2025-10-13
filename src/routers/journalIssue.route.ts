
import { Router } from 'express';
import { journalIssueValidationRules } from '../middlewares/validations/journalIssueValidation';
import { createJournalIssue, getJournalIssues, getJournalIssue, updateJournalIssue, deleteJournalIssue, getJournalIssueStats } from '../controllers/journalIssue.controller';
import { UserRole } from '@prisma/client';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();


router.route('/stats')
    .get(
        authenticate, 
        authorizeRoles(UserRole.ADMIN),
        getJournalIssueStats
    );

router.route('/')
  .post(
    authenticate,
    authorizeRoles(UserRole.ADMIN),
    journalIssueValidationRules, 
    createJournalIssue
    )
  .get(getJournalIssues);

router.route('/:id')
  .get(
    authenticate,
    authorizeRoles(UserRole.ADMIN),
    getJournalIssue
    )
  .patch(
    authenticate,
    authorizeRoles(UserRole.ADMIN),
    journalIssueValidationRules, 
    updateJournalIssue
    )
  .delete(
    authenticate,
    authorizeRoles(UserRole.ADMIN),
    deleteJournalIssue
    );

export default router;

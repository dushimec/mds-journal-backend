
import { Router } from 'express';
import { 
  getAuthorGuidelines, 
  getAuthorGuidelineByType, 
  createAuthorGuideline, 
  updateAuthorGuideline, 
  deleteAuthorGuideline,
  getAuthorGuidelineStats
} from '../controllers/authorGuideline.controller';
import { validate } from '../middlewares/validate';
import { 
  getAuthorGuidelineByTypeValidator, 
  createAuthorGuidelineValidator, 
  updateAuthorGuidelineValidator 
} from '../middlewares/validations/authorGuidelineValidation';

const router = Router();

router.post('/', createAuthorGuidelineValidator, validate, createAuthorGuideline);
router.get('/', getAuthorGuidelines);
router.get('/stats', getAuthorGuidelineStats);
router.get('/:type', getAuthorGuidelineByTypeValidator, validate, getAuthorGuidelineByType);
router.put('/:id', updateAuthorGuidelineValidator, validate, updateAuthorGuideline);
router.delete('/:id', deleteAuthorGuideline);

export default router;

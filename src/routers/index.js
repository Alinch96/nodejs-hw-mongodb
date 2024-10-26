import { authenticate } from '../middlewares/authenticate.js';
import authRouter from './auth.js';
import contactsRouter from './contacts.js';
import { Router } from 'express';

const router = Router();
router.use('/auth', authRouter);
router.use('/contacts', authenticate, contactsRouter);

export default router;

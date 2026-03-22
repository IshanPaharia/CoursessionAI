import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getCertificate, generateCertificate, getCertificateByUid } from '../controllers/certificates.js';

const router = Router();

// Public route — view certificate by shareable UID
router.get('/public/:uid', getCertificateByUid);

// Authenticated routes
router.use(requireAuth);
router.get('/:courseId', getCertificate);
router.post('/:courseId/generate', generateCertificate);

export default router;

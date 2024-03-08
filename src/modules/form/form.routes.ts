import express from 'express';
import FormController from './form.controller.ts';

const router = express.Router();

router.get('/:formId/filteredResponses', FormController.getFilteredResponses);

export default router;

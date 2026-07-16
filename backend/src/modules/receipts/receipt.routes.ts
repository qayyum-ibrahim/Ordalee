import { Router } from 'express';
import { createReceipt, listReceipts, getReceipt, getReceiptByClientId } from './receipt.controller';

const router = Router({ mergeParams: true });
router.post('/', createReceipt);
router.get('/', listReceipts);
router.get('/by-client-id/:clientReceiptId', getReceiptByClientId);
router.get('/:id', getReceipt);

export default router;
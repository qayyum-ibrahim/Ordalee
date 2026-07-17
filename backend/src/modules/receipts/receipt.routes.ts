import { Router } from 'express';
import { createReceipt, listReceipts, getReceipt, getReceiptByClientId, voidReceipt, restoreReceipt } from './receipt.controller';

const router = Router({ mergeParams: true });
router.post('/', createReceipt);
router.get('/', listReceipts);
router.get('/by-client-id/:clientReceiptId', getReceiptByClientId);
router.get('/:id', getReceipt);
router.patch('/:id/void', voidReceipt);
router.patch('/:id/restore', restoreReceipt);

export default router;
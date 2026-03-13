import { Router } from 'express'
import * as bidController from './bid.controller'
import { authenticate, authorizeRoles } from '../../middleware/auth'
import { validate } from '../../middleware/validate'
import { createBidSchema, rejectBidSchema } from './bid.schema'

const router = Router()

router.use(authenticate)

// Manufacturer submits a bid
router.post('/',
  authorizeRoles('manufacturer'),
  validate(createBidSchema),
  bidController.submitBid
)

// Manufacturer gets their own bids
router.get('/my-bids',
  authorizeRoles('manufacturer'),
  bidController.getMyBids
)

// Client gets all bids for a specific order
router.get('/order/:orderId',
  authorizeRoles('client'),
  bidController.getBidsForOrder
)

// AI suggestion for an order (manufacturer)
router.get('/ai-suggest/:orderId',
  authorizeRoles('manufacturer'),
  bidController.getAISuggestion
)

// Get single bid
router.get('/:id',
  bidController.getBidById
)

// Client accepts a bid
router.post('/:id/accept',
  authorizeRoles('client'),
  bidController.acceptBid
)

// Client rejects a bid
router.post('/:id/reject',
  authorizeRoles('client'),
  validate(rejectBidSchema),
  bidController.rejectBid
)

export default router

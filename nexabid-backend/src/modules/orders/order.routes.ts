import { Router } from 'express'
import * as orderController from './order.controller'
import { authenticate, authorizeRoles } from '../../middleware/auth'
import { validate } from '../../middleware/validate'
import { createOrderSchema, updateOrderSchema, swipeOrderSchema } from './order.schema'

const router = Router()

// All routes require authentication
router.use(authenticate)

// ─── Client Routes ────────────────────────────────────────────────
router.post('/',
  authorizeRoles('client'),
  validate(createOrderSchema),
  orderController.createOrder
)

router.get('/my-orders',
  authorizeRoles('client'),
  orderController.getMyOrders
)

router.get('/stats',
  authorizeRoles('client'),
  orderController.getOrderStats
)

// ─── Manufacturer Routes ──────────────────────────────────────────
router.get('/swipe-stack',
  authorizeRoles('manufacturer'),
  orderController.getSwipeStack
)

// ─── Shared Routes ────────────────────────────────────────────────
router.get('/:id',
  orderController.getOrderById
)

router.put('/:id',
  authorizeRoles('client'),
  validate(updateOrderSchema),
  orderController.updateOrder
)

router.delete('/:id',
  authorizeRoles('client'),
  orderController.deleteOrder
)

router.post('/:id/swipe',
  authorizeRoles('manufacturer'),
  validate(swipeOrderSchema),
  orderController.processSwipe
)

router.post('/:id/confirm',
  authorizeRoles('client'),
  orderController.confirmOrder
)

router.post('/:id/manufacturing-complete',
  authorizeRoles('manufacturer'),
  orderController.markManufacturingComplete
)

export default router

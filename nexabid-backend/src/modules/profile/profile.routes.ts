import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { validate } from '../../middleware/validate'
import { z } from 'zod'
import * as profileController from './profile.controller'

const router = Router()
router.use(authenticate)

const updateProfileSchema = z.object({
<<<<<<< HEAD
  fullName:          z.string().min(2).trim().optional(),
  phone:             z.string().min(7).trim().optional(),
  companyName:       z.string().trim().optional(),
  gstNumber:         z.string().trim().optional(),
  businessName:      z.string().trim().optional(),
  category:          z.string().trim().optional(),
  bio:               z.string().max(500).trim().optional(),
  address:           z.string().trim().optional(),
  website:           z.string().trim().optional(),
  linkedin:          z.string().trim().optional(),
  // Bank / payout details
  bankAccountName:   z.string().trim().optional(),
  bankAccountNumber: z.string().trim().optional(),
  bankIfsc:          z.string().trim().optional(),
  bankName:          z.string().trim().optional(),
=======
  fullName:     z.string().min(2).trim().optional(),
  phone:        z.string().min(7).trim().optional(),
  companyName:  z.string().trim().optional(),
  gstNumber:    z.string().trim().optional(),
  businessName: z.string().trim().optional(),
  category:     z.string().trim().optional(),
  bio:          z.string().max(500).trim().optional(),
  address:      z.string().trim().optional(),
  website:      z.string().trim().optional(),
  linkedin:     z.string().trim().optional(),
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
})

router.get('/',                                                     profileController.getProfile)
router.put('/',  validate(updateProfileSchema),                     profileController.updateProfile)
router.post('/change-password', validate(changePasswordSchema),     profileController.changePassword)
router.get('/stats',                                                profileController.getProfileStats)

export default router
<<<<<<< HEAD

// Account deletion (soft-delete — marks account inactive)
router.delete('/', profileController.deleteAccount)
=======
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c

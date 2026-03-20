// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay')
import { env } from './env'

let razorpay: any = null

export const getRazorpay = (): any => {
  if (!razorpay) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env')
    }
    razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    })
  }
  return razorpay
}

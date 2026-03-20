declare module 'razorpay' {
  interface RazorpayOptions { key_id: string; key_secret: string }
  interface OrderOptions { amount: number; currency: string; receipt?: string; notes?: Record<string, string> }
  interface RazorpayOrder { id: string; amount: number; currency: string; receipt: string; status: string }
  class Razorpay {
    constructor(options: RazorpayOptions)
    orders: { create(options: OrderOptions): Promise<RazorpayOrder>; fetch(id: string): Promise<RazorpayOrder> }
    payments: { fetch(id: string): Promise<any>; refund(id: string, opts: any): Promise<any> }
    static validateWebhookSignature(body: string, sig: string, secret: string): boolean
  }
  export = Razorpay
}

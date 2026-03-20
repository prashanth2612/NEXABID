// generateInvoice.ts — generates a print-ready invoice HTML and triggers browser PDF save

interface InvoiceData {
  orderNumber: string
  orderTitle: string
  category: string
  clientName: string
  clientEmail: string
  manufacturerName: string
  manufacturerEmail: string
  amount: number
  platformFee?: number
  manufacturerPayout?: number
  completedAt?: string
  createdAt: string
  paymentId?: string
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

export function generateInvoice(data: InvoiceData) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${data.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #0a0a0a; padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; padding-bottom: 24px; border-bottom: 2px solid #0a0a0a; }
    .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; }
    .logo span { color: #0064e0; }
    .invoice-label { text-align: right; }
    .invoice-label h1 { font-size: 32px; font-weight: 900; color: #0a0a0a; letter-spacing: -1px; }
    .invoice-label p { color: #6b7280; font-size: 13px; margin-top: 4px; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .party h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #9ca3af; margin-bottom: 8px; }
    .party p { font-size: 14px; line-height: 1.6; }
    .party .name { font-weight: 700; font-size: 16px; margin-bottom: 2px; }
    .order-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px; }
    .order-box h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #9ca3af; margin-bottom: 8px; }
    .order-box .title { font-size: 18px; font-weight: 700; }
    .order-box .meta { font-size: 13px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #9ca3af; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    td { padding: 14px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .amount { font-weight: 700; }
    .total-row td { border-bottom: none; padding-top: 16px; font-weight: 700; font-size: 16px; }
    .total-row td:last-child { color: #0064e0; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; background: #ecfdf5; color: #059669; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 100px; }
    .status-badge::before { content: '✓'; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: flex-end; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.6; }
    .payment-id { font-family: monospace; font-size: 11px; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; color: #6b7280; }
    @media print {
      body { padding: 24px; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Nexa<span>Bid</span></div>
    <div class="invoice-label">
      <h1>INVOICE</h1>
      <p>${data.orderNumber}</p>
      <p style="margin-top:8px">${fmtDate(data.completedAt || data.createdAt)}</p>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Bill To</h3>
      <p class="name">${data.clientName}</p>
      <p>${data.clientEmail}</p>
    </div>
    <div class="party">
      <h3>Fulfilled By</h3>
      <p class="name">${data.manufacturerName}</p>
      <p>${data.manufacturerEmail}</p>
    </div>
  </div>

  <div class="order-box">
    <h3>Order Details</h3>
    <p class="title">${data.orderTitle}</p>
    <p class="meta">Category: ${data.category} &nbsp;·&nbsp; Order #${data.orderNumber}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${data.orderTitle}<br /><span style="color:#9ca3af;font-size:12px">${data.category}</span></td>
        <td class="amount" style="text-align:right">${fmt(data.amount)}</td>
      </tr>
      ${data.platformFee ? `
      <tr>
        <td style="color:#6b7280">Platform fee (2.5%)</td>
        <td style="text-align:right;color:#6b7280">-${fmt(data.platformFee)}</td>
      </tr>` : ''}
      <tr class="total-row">
        <td>Total Paid</td>
        <td style="text-align:right">${fmt(data.amount)}</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-bottom:32px">
    <span class="status-badge">Payment Completed &amp; Verified</span>
    ${data.paymentId ? `<p style="margin-top:12px;font-size:12px;color:#9ca3af">Payment reference: <span class="payment-id">${data.paymentId}</span></p>` : ''}
  </div>

  <div class="footer">
    <div>
      <p>NexaBid Technologies Pvt. Ltd.</p>
      <p>CIN: U74999MH2024PTC000001 &nbsp;·&nbsp; GST: 27AAAXX0000X1ZX</p>
      <p>support@nexabid.com &nbsp;·&nbsp; nexabid.com</p>
    </div>
    <div style="text-align:right">
      <p>Generated on ${fmtDate(new Date().toISOString())}</p>
      <p style="margin-top:4px;font-size:11px;color:#d1d5db">This is a computer-generated invoice</p>
    </div>
  </div>
</body>
</html>`

  // Open in new window and trigger print dialog (saves as PDF)
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) { alert('Please allow popups to download invoice'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 500)
}

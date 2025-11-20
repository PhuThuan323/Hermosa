export const salesSeries = [
  { label: 'Jan', value: 4200 },
  { label: 'Feb', value: 5100 },
  { label: 'Mar', value: 4800 },
  { label: 'Apr', value: 6100 },
  { label: 'May', value: 7200 },
  { label: 'Jun', value: 6800 },
]

export const orders = [
  { id: 'ORD-1001', customer: 'Alice Nguyen', total: '$120.50', status: 'Paid', date: '2025-10-01' },
  { id: 'ORD-1002', customer: 'Bob Tran', total: '$89.90', status: 'Pending', date: '2025-10-02' },
  { id: 'ORD-1003', customer: 'Carol Pham', total: '$231.00', status: 'Refunded', date: '2025-10-03' },
  { id: 'ORD-1004', customer: 'David Le', total: '$57.20', status: 'Paid', date: '2025-10-04' },
]

export const customers = [
  { name: 'Alice Nguyen', email: 'alice@example.com', tier: 'Gold', orders: 24 },
  { name: 'Bob Tran', email: 'bob@example.com', tier: 'Silver', orders: 12 },
  { name: 'Carol Pham', email: 'carol@example.com', tier: 'Bronze', orders: 5 },
]

export const products = [
  { sku: 'SKU-001', name: 'Keyboard', price: '$39.00', stock: 120 },
  { sku: 'SKU-002', name: 'Mouse', price: '$19.00', stock: 200 },
  { sku: 'SKU-003', name: 'Monitor', price: '$159.00', stock: 45 },
]

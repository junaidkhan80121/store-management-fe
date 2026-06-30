export const INBOUND_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PREINWARD', label: 'Preinward' },
  { value: 'QUALITY', label: 'Quality' },
  { value: 'DOCKYARD', label: 'Dockyard' },
  { value: 'SLOTTED', label: 'Slotted' },
  { value: 'REJECTED', label: 'Rejected' },
];

export const OUTBOUND_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DEMAND_DRAFT', label: 'Demand Draft' },
  { value: 'STORE_OUT', label: 'Store Out' },
  { value: 'PACKING_DRAFT', label: 'Packing Draft' },
  { value: 'PACKING', label: 'Packing' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'FINAL_OUTWARD', label: 'Final Outward' },
];

export const INBOUND_SORT_OPTIONS = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'crates_count', label: 'Crates' },
  { value: 'total_weight_kg', label: 'Weight' },
  { value: 'item_type', label: 'Item Type' },
  { value: 'status', label: 'Status' },
];

export const OUTBOUND_SORT_OPTIONS = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'crates_out', label: 'Crates' },
  { value: 'weight_out_kg', label: 'Weight' },
  { value: 'buyer_name', label: 'Buyer' },
  { value: 'status', label: 'Status' },
];

export const INVOICE_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ISSUED', label: 'Issued' },
  { value: 'PAID', label: 'Paid' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const INVOICE_SORT_OPTIONS = [
  { value: 'issued_at', label: 'Issue Date' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'invoice_number', label: 'Invoice #' },
  { value: 'buyer_name', label: 'Buyer' },
  { value: 'total_amount', label: 'Total Amount' },
  { value: 'subtotal', label: 'Subtotal' },
  { value: 'weight_out_kg', label: 'Weight' },
  { value: 'status', label: 'Status' },
];

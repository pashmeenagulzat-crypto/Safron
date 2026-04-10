/** Validates a 10-digit Indian mobile number (starts with 6–9). */
export function isValidIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

/** Validates a 6-digit Indian pincode. */
export function isValidPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}

/** Format a price in Indian Rupees. */
export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

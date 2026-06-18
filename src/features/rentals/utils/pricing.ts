/** Platform commission rate applied to rental subtotal (excl. fee). */
export const PLATFORM_FEE_RATE = 0.1;

export function calcRentalSubtotal(pricePerDay: number, days: number): number {
  return pricePerDay * days;
}

export function calcPlatformFee(subtotal: number): number {
  return Math.round(subtotal * PLATFORM_FEE_RATE);
}

export function calcBookingTotal(pricePerDay: number, days: number): number {
  const subtotal = calcRentalSubtotal(pricePerDay, days);
  return subtotal + calcPlatformFee(subtotal);
}

export function platformFeePercentLabel(): string {
  return `${Math.round(PLATFORM_FEE_RATE * 100)}%`;
}

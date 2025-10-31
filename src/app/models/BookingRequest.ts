/**
 * Booking Request DTO for creating new bookings
 * Maps to backend BookingRequest DTO
 */
export interface BookingRequest {
  // ===== ROUTE DETAILS (Step 1) =====
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string; // Format: YYYY-MM-DD (LocalDate)
  pickupTime: string; // Format: HH:mm (LocalTime)

  // ===== GOODS DETAILS (Step 2) =====
  goodsType: string; // Maps to cargo.goodsCategory
  goodsWeight: number; // Maps to cargo.weight (BigDecimal)
  goodsDescription: string; // Maps to cargo.description
  specialHandling: boolean; // Maps to cargo.requiresSpecialHandling
  fragile: boolean; // Maps to cargo.fragile
  perishable: boolean; // Maps to cargo.perishable

  // ===== VEHICLE SELECTION (Step 3) =====
  selectedVehicleType: 'truck' | 'van' | 'pickup' | 'heavy-truck'; // Maps to vehicleType
  vehicleId?: string; // Maps to vehicleId
  vehicleName?: string; // Maps to vehicleName
  vehicleCapacity?: number; // Maps to vehicleCapacity

  // ===== CONTACT & PAYMENT (Step 4) =====
  contactName: string; // Maps to pickupContact.name & deliveryContact.name
  contactPhone: string; // Maps to pickupContact.phoneNumber & deliveryContact.phoneNumber
  contactEmail: string; // Maps to pickupContact.email & deliveryContact.email
  additionalNotes?: string; // Maps to bookingNotes
  paymentMethod: 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'cash'; // Maps to payment.method

  // ===== PRICING INFORMATION =====
  basePrice: number; // Maps to pricing.baseFare (BigDecimal)
  insuranceCost: number; // Maps to pricing.insuranceCharge (BigDecimal)
  taxAmount: number; // Maps to pricing.gstAmount (BigDecimal)
  totalAmount: number; // Maps to pricing.totalAmount & pricing.finalAmount (BigDecimal)
  estimatedDistance?: number; // Maps to totalDistance (BigDecimal)
  estimatedDuration?: number; // Maps to estimatedDuration (Integer - minutes)

  // ===== PAYMENT STATUS =====
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'; // Maps to payment.status
  razorpayOrderId?: string; // Maps to payment.transactionId
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

/**
 * Booking Response DTO from backend after booking creation
 */
export interface BookingResponse {
  id: string;
  bookingNumber: string;
  customerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'DISPUTED';
  message: string;
  createdAt: string;
  razorpayOrderId?: string;
}

/**
 * Booking Details for display
 */
export interface BookingDetails extends BookingRequest {
  id: string;
  bookingNumber: string;
  customerId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
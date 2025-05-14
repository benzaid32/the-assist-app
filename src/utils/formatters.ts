/**
 * Utility functions for formatting values in The Assist App
 * Following enterprise-grade development guidelines for consistent formatting
 */

/**
 * Format a number as USD currency
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

/**
 * Format a percentage value
 * @param value - The percentage value (0-100)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Format a phone number to standard US format
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "");
  
  // Check if the input is valid
  if (cleaned.length !== 10) {
    return phoneNumber; // Return original if not valid
  }
  
  // Format as (XXX) XXX-XXXX
  return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
};

/**
 * Format a number with appropriate suffix (K, M, B)
 * @param num - The number to format
 * @returns Formatted number string
 */
export const formatCompactNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  } else if (num < 1000000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else if (num < 1000000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
};

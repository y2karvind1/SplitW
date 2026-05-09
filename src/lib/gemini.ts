export interface ReceiptData {
  total: number;
  currency: string;
  items: Array<{ name: string; price: number }>;
  date?: string;
  merchant?: string;
}

/**
 * Mock receipt scanner to avoid Gemini API billing requirements.
 * Simulates a successful scan with random data.
 */
export async function scanReceipt(base64Image: string, mimeType: string): Promise<ReceiptData> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    total: Math.floor(Math.random() * 100) + 15.50,
    currency: "USD",
    merchant: "Simulated Merchant",
    items: [
      { name: "Item 1", price: 10.00 },
      { name: "Item 2", price: 5.50 }
    ],
    date: new Date().toISOString()
  };
}

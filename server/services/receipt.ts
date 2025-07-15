import { storage } from "../storage";
import { analyzeReceipt, extractTextFromReceipt } from "./openai";
import type { InsertReceipt } from "@shared/schema";

export async function processReceiptImage(
  userId: string,
  base64Image: string,
  imageUrl?: string
): Promise<{ receiptId: number; analysis: any }> {
  try {
    // Extract text and analyze the receipt
    const [ocrText, analysis] = await Promise.all([
      extractTextFromReceipt(base64Image),
      analyzeReceipt(base64Image)
    ]);

    // Create receipt record
    const receiptData: InsertReceipt = {
      userId,
      vendor: analysis.vendor,
      amount: analysis.amount.toString(),
      category: analysis.category,
      date: new Date(analysis.date),
      description: analysis.description,
      imageUrl: imageUrl || null,
      ocrText,
      aiAnalysis: analysis,
    };

    const receipt = await storage.createReceipt(receiptData);
    
    return {
      receiptId: receipt.id,
      analysis: {
        ...analysis,
        receiptId: receipt.id,
      }
    };
  } catch (error) {
    console.error("Receipt processing error:", error);
    throw new Error("Failed to process receipt: " + error.message);
  }
}

export function generateCSV(receipts: any[]): string {
  const headers = [
    "Date",
    "Vendor",
    "Amount",
    "Category",
    "Description",
    "Receipt ID"
  ];

  const rows = receipts.map(receipt => [
    new Date(receipt.date).toISOString().split('T')[0],
    receipt.vendor,
    receipt.amount,
    receipt.category,
    receipt.description || "",
    receipt.id.toString()
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(","))
    .join("\n");

  return csvContent;
}

export async function getUserReceiptsCSV(userId: string): Promise<string> {
  const receipts = await storage.getReceipts(userId, 1000); // Get up to 1000 receipts
  return generateCSV(receipts);
}

import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ReceiptAnalysis {
  vendor: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  confidence: number;
}

export async function analyzeReceipt(base64Image: string): Promise<ReceiptAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert receipt analyzer. Analyze the receipt image and extract the following information in JSON format:
          
          {
            "vendor": "Business name",
            "amount": 0.00,
            "date": "YYYY-MM-DD",
            "category": "one of: meals, travel, office_supplies, equipment, utilities, marketing, entertainment, healthcare, professional_services, other",
            "description": "Brief description of the purchase",
            "items": [{"name": "item name", "quantity": 1, "price": 0.00}],
            "confidence": 0.95
          }
          
          Categories explained:
          - meals: Food, drinks, restaurants, catering
          - travel: Transportation, hotels, flights, gas, parking
          - office_supplies: Paper, pens, ink, basic office items
          - equipment: Computers, furniture, machinery, tools
          - utilities: Phone, internet, electricity, water
          - marketing: Advertising, promotional materials, websites
          - entertainment: Client entertainment, team events
          - healthcare: Medical expenses, insurance
          - professional_services: Legal, accounting, consulting
          - other: Anything that doesn't fit the above categories
          
          Be accurate with amounts and dates. If you can't read something clearly, set confidence lower.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this receipt and extract the expense information as JSON."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and format the response
    return {
      vendor: result.vendor || "Unknown Vendor",
      amount: parseFloat(result.amount) || 0,
      date: result.date || new Date().toISOString().split('T')[0],
      category: result.category || "other",
      description: result.description || "",
      items: result.items || [],
      confidence: Math.min(Math.max(result.confidence || 0.5, 0), 1),
    };
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    throw new Error("Failed to analyze receipt: " + error.message);
  }
}

export async function extractTextFromReceipt(base64Image: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract all text from this receipt image. Return the raw text as it appears on the receipt."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Text extraction error:", error);
    throw new Error("Failed to extract text from receipt: " + error.message);
  }
}

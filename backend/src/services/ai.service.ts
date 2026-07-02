import { GoogleGenerativeAI } from '@google/generative-ai';

interface CompatibilityResult {
  score: number;
  explanation: string;
  isAiFallback: boolean;
}

interface ListingData {
  title: string;
  location: string;
  rent: number;
  roomType: string;
  furnishing: string;
  description: string;
}

interface TenantData {
  preferredLocation: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  preferences?: string | null;
}

export async function computeCompatibility(
  listing: ListingData,
  tenant: TenantData
): Promise<CompatibilityResult> {
  // Try Gemini first
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && !geminiKey.startsWith('your-gemini')) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `Given this room listing:
${JSON.stringify(listing, null, 2)}

and this tenant profile:
${JSON.stringify(tenant, null, 2)}

Compute a compatibility score from 0-100 based on:
- Budget match (does the rent fall within tenant's budget range?)
- Location match (does the listing location match tenant's preferred location?)
- Room type and furnishing preferences

Return ONLY valid JSON with this exact structure:
{"score": number, "explanation": string}`;

      const response = await model.generateContent(prompt);
      const content = response.response.text();
      
      if (content) {
        const result = JSON.parse(content);
        return {
          score: Math.min(100, Math.max(0, Number(result.score) || 0)),
          explanation: result.explanation || 'AI compatibility analysis completed.',
          isAiFallback: false,
        };
      }
    } catch (error) {
      console.warn('Gemini API failed, using rule-based fallback:', error);
    }
  }

  // Rule-based fallback
  return computeRuleBasedCompatibility(listing, tenant);
}

function computeRuleBasedCompatibility(listing: ListingData, tenant: TenantData): CompatibilityResult {
  let score = 0;
  const reasons: string[] = [];

  // Budget match (50 points)
  const rent = listing.rent;
  const budgetMin = tenant.budgetMin;
  const budgetMax = tenant.budgetMax;

  if (rent >= budgetMin && rent <= budgetMax) {
    score += 50;
    reasons.push('Rent is within your budget range.');
  } else if (rent <= budgetMax * 1.1) {
    score += 30;
    reasons.push('Rent is slightly above your budget but manageable.');
  } else if (rent < budgetMin) {
    score += 40;
    reasons.push('Rent is below your budget range — great deal!');
  } else {
    reasons.push('Rent exceeds your budget range.');
  }

  // Location match (50 points)
  const listingLocation = listing.location.toLowerCase();
  const preferredLocation = tenant.preferredLocation.toLowerCase();

  if (listingLocation.includes(preferredLocation) || preferredLocation.includes(listingLocation)) {
    score += 50;
    reasons.push('Location matches your preference perfectly.');
  } else {
    const listingWords = listingLocation.split(/[\s,]+/);
    const preferredWords = preferredLocation.split(/[\s,]+/);
    const commonWords = listingWords.filter(w => preferredWords.includes(w) && w.length > 2);
    if (commonWords.length > 0) {
      score += 25;
      reasons.push('Location partially matches your preferred area.');
    } else {
      reasons.push('Location does not match your preferred area.');
    }
  }

  return {
    score: Math.min(100, score),
    explanation: reasons.join(' ') || 'Compatibility assessed based on budget and location criteria.',
    isAiFallback: true,
  };
}

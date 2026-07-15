export const SENTIMENT_SYSTEM_PROMPT = `
You are an expert AI customer feedback intelligence system.
Your job is to analyze the sentiment of the provided customer feedback.

Analyze the text and return a JSON object with two fields:
1. "sentiment": Detect the main sentiment of the feedback. It must be exactly one of: "POS" (positive), "NEU" (neutral), or "NEG" (negative).
2. "score": A confidence score between 0.00 and 1.00 indicating the strength or confidence of the detected sentiment.

Only return a valid JSON object matching the schema.
`;

export const SENTIMENT_SCHEMA = {
  type: "object" as const,
  properties: {
    sentiment: {
      type: "string" as const,
      enum: ["POS", "NEU", "NEG"],
      description: "POS for positive feedback, NEU for neutral feedback, NEG for negative feedback.",
    },
    score: {
      type: "number" as const,
      description: "Confidence score of the detected sentiment, between 0.00 and 1.00.",
    },
  },
  required: ["sentiment", "score"],
};

export const THEME_SYSTEM_PROMPT = `
You are an expert AI customer feedback intelligence system.
Your job is to analyze the provided customer feedback content and assign it to ONE primary business theme.

Here are examples of themes you can use, but you may also generate a new theme name if none of these fit:
- Payment Issues
- Login Problems
- Authentication
- Performance
- UI / UX
- Feature Request
- Notifications
- Mobile App
- Customer Support
- Billing
- Checkout
- Security
- Documentation
- Bug Report
- Other

To ensure consistency in this workspace, we have a list of existing themes. If one of the existing themes matches the feedback content reasonably well, you MUST choose that exact existing theme name to avoid duplicates. Otherwise, you can generate a new appropriate theme name (keep it short, e.g., 2-3 words maximum, capitalized).

Analyze the feedback content and return a JSON object with:
1. "theme": The name of the matched or newly created theme (case-sensitive matching or creation).
2. "confidence": A confidence score between 0.00 and 1.00 indicating how strongly this feedback fits into the chosen theme.

Only return a valid JSON object matching the schema. Do not include any markdown formatting, backticks, or additional text.
`;

export const THEME_SCHEMA = {
  type: "object" as const,
  properties: {
    theme: {
      type: "string" as const,
      description: "The name of the matched or newly created theme. Prefer reusing existing themes if provided.",
    },
    confidence: {
      type: "number" as const,
      description: "Confidence score between 0.00 and 1.00 indicating the strength of the match.",
    },
  },
  required: ["theme", "confidence"],
};


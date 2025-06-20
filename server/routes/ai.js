import express from 'express';
import { OpenAI } from 'openai';
import Joi from 'joi';
import logger from '../utils/logger.js';
import { validateRequest } from '../middleware/validation.js';
import dotenv from 'dotenv'

dotenv.config()
const router = express.Router();

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add your OpenAI API key here
});

const generateContentSchema = Joi.object({
  productData: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    specifications: Joi.object().default({}),
    price: Joi.string().allow(null),
    url: Joi.string().uri().required(),
  }).required(),
  options: Joi.object({
    tone: Joi.string()
      .valid('professional', 'casual', 'technical')
      .default('professional'),
    length: Joi.string().valid('short', 'medium', 'long').default('medium'),
    includeFeatures: Joi.boolean().default(true),
    includeBenefits: Joi.boolean().default(true),
  }).default({}),
});

// Generate enhanced product content
router.post(
  '/generate-content',
  validateRequest(generateContentSchema),
  async (req, res) => {
    const { productData, options } = req.body;

    try {
      logger.info(`Generating AI content for product: ${productData.title}`);

      // Create comprehensive prompt
      const prompt = `
You are a professional product catalog writer. Generate compelling, accurate, and detailed content for the following product:

PRODUCT INFORMATION:
- Title: ${productData.title}
- Description: ${productData.description}
- Price: ${productData.price || 'Not specified'}
- Specifications: ${JSON.stringify(productData.specifications, null, 2)}
- Source URL: ${productData.url}

REQUIREMENTS:
- Tone: ${options.tone}
- Length: ${options.length}
- Include features: ${options.includeFeatures}
- Include benefits: ${options.includeBenefits}

Please generate the following content in JSON format:

{
  "title": "Enhanced, compelling product title (max 80 characters)",
  "description": "Professional product description (${
    options.length === 'short'
      ? '100-200'
      : options.length === 'medium'
      ? '200-400'
      : '400-600'
  } words)",
  "specifications": {
    "Enhanced specifications object with improved formatting and additional technical details"
  },
  "features": [
    "Array of 5-8 key product features as bullet points"
  ],
  "benefits": [
    "Array of 4-6 customer benefits explaining why they should choose this product"
  ],
  "keywords": [
    "Array of 8-12 SEO keywords relevant to this product"
  ],
  "category": "Product category classification",
  "targetAudience": "Primary target audience description"
}

Guidelines:
- Make the content engaging and persuasive
- Focus on unique selling points
- Use industry-appropriate terminology
- Ensure all content is factual and based on provided information
- Optimize for both readability and SEO
- Maintain consistency in tone throughout
`;

      // Make a request to OpenAI GPT model
      const result = await openai.chat.completions.create({
        model: 'gpt-4', // You can replace with gpt-3.5 or other models if needed
        messages: [
          {
            role: 'system',
            content:
              'You are an assistant for generating product catalog content.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500, // Adjust token limit as needed
      });

      const text = result.choices[0].message.content;

      let generatedContent;
      try {
        // Extract JSON from the response (remove any markdown formatting)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          generatedContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in AI response');
        }
      } catch (parseError) {
        logger.error('Failed to parse AI response:', parseError);

        // Fallback content generation
        generatedContent = {
          title: productData.title,
          description: productData.description,
          specifications: productData.specifications,
          features: [
            'High-quality construction and materials',
            'User-friendly design and interface',
            'Reliable performance and durability',
            'Excellent value for money',
            'Comprehensive warranty coverage',
          ],
          benefits: [
            'Saves time and increases efficiency',
            'Provides long-lasting value',
            'Easy to use and maintain',
            'Backed by excellent customer support',
          ],
          keywords: ['product', 'quality', 'reliable', 'efficient'],
          category: 'General Product',
          targetAudience: 'General consumers',
        };
      }

      // Validate and clean the generated content
      const cleanedContent = {
        title: generatedContent.title || productData.title,
        description: generatedContent.description || productData.description,
        specifications: {
          ...productData.specifications,
          ...generatedContent.specifications,
        },
        features: Array.isArray(generatedContent.features)
          ? generatedContent.features.slice(0, 8)
          : ['High-quality product with excellent features'],
        benefits: Array.isArray(generatedContent.benefits)
          ? generatedContent.benefits.slice(0, 6)
          : ['Provides excellent value and performance'],
        keywords: Array.isArray(generatedContent.keywords)
          ? generatedContent.keywords.slice(0, 12)
          : ['product', 'quality'],
        category: generatedContent.category || 'Product',
        targetAudience: generatedContent.targetAudience || 'General consumers',
        generatedAt: new Date().toISOString(),
      };

      logger.info(
        `Successfully generated AI content for: ${cleanedContent.title}`,
      );

      res.json({
        success: true,
        data: cleanedContent,
      });
    } catch (error) {
      logger.error('AI content generation error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to generate AI content',
        message: error.message,
      });
    }
  },
);

// Generate product suggestions
router.post(
  '/suggest-improvements',
  validateRequest(generateContentSchema),
  async (req, res) => {
    const { productData } = req.body;

    try {
      const prompt = `
Analyze this product catalog content and suggest improvements:

CURRENT CONTENT:
${JSON.stringify(productData, null, 2)}

Provide suggestions in JSON format:
{
  "titleSuggestions": ["Alternative title 1", "Alternative title 2", "Alternative title 3"],
  "descriptionImprovements": ["Improvement suggestion 1", "Improvement suggestion 2"],
  "missingFeatures": ["Feature that should be highlighted 1", "Feature 2"],
  "seoRecommendations": ["SEO tip 1", "SEO tip 2"],
  "layoutSuggestions": ["Layout improvement 1", "Layout improvement 2"]
}
`;

      const result = await openai.chat.completions.create({
        model: 'gpt-4', // Or gpt-3.5
        messages: [
          {
            role: 'system',
            content:
              'You are an assistant for suggesting product catalog improvements.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
      });

      const text = result.choices[0].message.content;

      let suggestions;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch (parseError) {
        suggestions = {
          titleSuggestions: ['Consider adding key benefits to the title'],
          descriptionImprovements: ['Add more specific technical details'],
          missingFeatures: ['Consider highlighting unique selling points'],
          seoRecommendations: ['Include relevant keywords naturally'],
          layoutSuggestions: ['Use bullet points for better readability'],
        };
      }

      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      logger.error('AI suggestions error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to generate suggestions',
        message: error.message,
      });
    }
  },
);

export default router;

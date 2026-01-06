import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * OpenAI Client Singleton
 * 
 * Manages connection to OpenAI API
 * Used for AI chat responses
 */

let openaiClient: OpenAI | null = null;

/**
 * Get or create OpenAI client
 * 
 * Lazy initialization - only creates client when first accessed
 * Singleton pattern - reuses same instance
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    logger.info('Initializing OpenAI client...');
    logger.info(`Model: ${config.openai.model}`);
    logger.info(`Max tokens: ${config.openai.maxTokens}`);

    openaiClient = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    logger.info('✅ OpenAI client initialized');
  }

  return openaiClient;
}

/**
 * Test OpenAI connection
 * 
 * Makes a simple API call to verify credentials
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    logger.info('Testing OpenAI connection...');
    
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: 'user', content: 'Say "OK" if you can read this.' }],
      max_tokens: 10,
    });

    const reply = response.choices[0]?.message?.content || '';
    logger.info(`✅ OpenAI connection test successful: ${reply}`);
    
    return true;
  } catch (error) {
    logger.error('❌ OpenAI connection test failed:', error);
    return false;
  }
}

/**
 * Calculate estimated cost for a request
 * 
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @returns Estimated cost in USD
 */
export function calculateCost(inputTokens: number, outputTokens: number): number {
  // GPT-3.5-turbo pricing (per 1K tokens)
  const INPUT_COST = 0.0005;  // $0.0005 per 1K input tokens
  const OUTPUT_COST = 0.0015; // $0.0015 per 1K output tokens

  const inputCost = (inputTokens / 1000) * INPUT_COST;
  const outputCost = (outputTokens / 1000) * OUTPUT_COST;

  return inputCost + outputCost;
}



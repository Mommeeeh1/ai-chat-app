import { logger } from '../utils/logger';

/**
 * Ollama Client for Local AI
 * 
 * Free, local AI models - no API costs!
 * Uses Llama 3.2 running on your machine
 */

const OLLAMA_URL = 'http://localhost:11434';
const MODEL_NAME = 'llama3.2:1b';

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

/**
 * Send a chat request to Ollama
 * 
 * @param messages - Conversation history
 * @returns AI response
 */
export async function chatWithOllama(messages: OllamaMessage[]): Promise<string> {
  try {
    logger.debug('Sending request to Ollama...', { messageCount: messages.length });

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages,
        stream: false, // Get complete response at once
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as OllamaResponse;
    const reply = data.message.content;

    logger.debug('Ollama response received', { 
      replyLength: reply.length,
      model: data.model 
    });

    return reply;
  } catch (error) {
    logger.error('Ollama request error:', error);
    throw new Error('Failed to get AI response. Is Ollama running?');
  }
}

/**
 * Test Ollama connection
 */
export async function testOllamaConnection(): Promise<boolean> {
  try {
    logger.info('Testing Ollama connection...');

    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    
    if (!response.ok) {
      logger.error('Ollama is not responding');
      return false;
    }

    const data = await response.json() as { models: any[] };
    const models = data.models || [];

    if (models.length === 0) {
      logger.warn('⚠️  No models found. Please download a model.');
      return false;
    }

    logger.info(`✅ Ollama connection successful`);
    logger.info(`Available models: ${models.map((m: any) => m.name).join(', ')}`);
    
    // Test actual chat
    const testReply = await chatWithOllama([
      { role: 'user', content: 'Say "OK" if you can read this.' }
    ]);
    
    logger.info(`✅ Test chat successful: ${testReply.substring(0, 50)}...`);
    
    return true;
  } catch (error) {
    logger.error('❌ Ollama connection test failed:', error);
    return false;
  }
}

/**
 * Build system prompt for fitness trainer
 * 
 * @param userProfile - User's profile data
 * @returns System message
 */
export function buildSystemPrompt(userProfile?: {
  name?: string;
  age?: number;
  gender?: string;
  currentWeight?: number;
  targetWeight?: number;
  primaryGoal?: string;
  activityLevel?: string;
  dietaryRestrictions?: string[];
  availableEquipment?: string[];
  workoutDaysPerWeek?: number;
}): OllamaMessage {
  let prompt = `You are an expert personal fitness trainer and nutritionist. Your role is to provide personalized, actionable fitness and nutrition advice. `;
  
  if (userProfile) {
    prompt += `\n\n=== CLIENT PROFILE ===\n`;
    prompt += `You are working with a specific client. ALWAYS reference their profile when giving advice:\n\n`;
    
    const profileParts: string[] = [];
    
    if (userProfile.name) profileParts.push(`Name: ${userProfile.name}`);
    if (userProfile.age) profileParts.push(`Age: ${userProfile.age} years old`);
    if (userProfile.gender) profileParts.push(`Gender: ${userProfile.gender}`);
    
    if (userProfile.currentWeight && userProfile.targetWeight) {
      const weightDiff = userProfile.targetWeight - userProfile.currentWeight;
      const direction = weightDiff > 0 ? 'gain' : 'lose';
      profileParts.push(`Weight: ${userProfile.currentWeight}kg → ${userProfile.targetWeight}kg (${direction} ${Math.abs(weightDiff)}kg)`);
    } else if (userProfile.currentWeight) {
      profileParts.push(`Current weight: ${userProfile.currentWeight}kg`);
    } else if (userProfile.targetWeight) {
      profileParts.push(`Target weight: ${userProfile.targetWeight}kg`);
    }
    
    if (userProfile.primaryGoal) {
      const goalMap: Record<string, string> = {
        lose_weight: 'Lose weight and burn fat',
        gain_muscle: 'Build muscle and gain strength',
        maintain: 'Maintain current fitness level',
        improve_endurance: 'Improve cardiovascular endurance',
        general_fitness: 'General fitness and health',
      };
      profileParts.push(`Primary Goal: ${goalMap[userProfile.primaryGoal] || userProfile.primaryGoal}`);
    }
    
    if (userProfile.activityLevel) {
      const levelMap: Record<string, string> = {
        sedentary: 'Sedentary (little/no exercise)',
        lightly_active: 'Lightly active (1-3 days/week)',
        moderately_active: 'Moderately active (3-5 days/week)',
        very_active: 'Very active (6-7 days/week)',
        extremely_active: 'Extremely active (athlete level)',
      };
      profileParts.push(`Activity Level: ${levelMap[userProfile.activityLevel] || userProfile.activityLevel}`);
    }
    
    if (userProfile.workoutDaysPerWeek) {
      profileParts.push(`Workout Schedule: ${userProfile.workoutDaysPerWeek} days per week`);
    }
    
    if (userProfile.dietaryRestrictions && userProfile.dietaryRestrictions.length > 0) {
      profileParts.push(`Dietary Restrictions: ${userProfile.dietaryRestrictions.map(r => r.replace('_', ' ')).join(', ')}`);
    }
    
    if (userProfile.availableEquipment && userProfile.availableEquipment.length > 0) {
      const equipment = userProfile.availableEquipment.map(e => e.replace('_', ' '));
      if (equipment.includes('none')) {
        profileParts.push(`Equipment: Bodyweight only (no equipment)`);
      } else {
        profileParts.push(`Available Equipment: ${equipment.join(', ')}`);
    }
    }
    
    prompt += profileParts.join('\n');
    
    prompt += `\n\n=== INSTRUCTIONS ===\n`;
    prompt += `1. ALWAYS consider their profile when answering\n`;
    prompt += `2. For nutrition: Respect dietary restrictions and align with their weight goal\n`;
    prompt += `3. For workouts: Only suggest exercises they can do with their available equipment\n`;
    prompt += `4. Match workout intensity to their activity level\n`;
    prompt += `5. Reference specific details from their profile (e.g., "Since you want to lose ${userProfile.currentWeight && userProfile.targetWeight ? Math.abs(userProfile.targetWeight - userProfile.currentWeight) : ''}kg...")\n`;
    prompt += `6. Be encouraging and specific to their situation\n`;
  } else {
    prompt += `\n\nNote: No client profile available. Provide general fitness advice, but mention that personalized recommendations would be more effective if they complete their profile.`;
  }
  
  prompt += `\n\n=== RESPONSE GUIDELINES ===\n`;
  prompt += `- Be encouraging, professional, and practical\n`;
  prompt += `- Keep responses concise (under 300 words)\n`;
  prompt += `- Use simple markdown for formatting (bold, lists)\n`;
  prompt += `- Provide actionable, step-by-step advice when possible\n`;
  prompt += `- If suggesting a workout, include sets, reps, and rest periods\n`;
  prompt += `- If suggesting nutrition, include portion sizes and meal timing`;

  return {
    role: 'system',
    content: prompt
  };
}


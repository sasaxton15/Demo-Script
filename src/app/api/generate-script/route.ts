import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Environment configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai';

// Initialize API clients based on environment variables
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
const genAI = GOOGLE_AI_API_KEY ? new GoogleGenerativeAI(GOOGLE_AI_API_KEY) : null;

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['productName', 'audience', 'description', 'keyFeatures', 'painPoints'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Generate script based on selected provider
    let result;
    try {
      switch (LLM_PROVIDER.toLowerCase()) {
        case 'openai':
          result = await generateWithOpenAI(body);
          break;
        case 'anthropic':
          result = await generateWithAnthropic(body);
          break;
        case 'google':
          result = await generateWithGoogle(body);
          break;
        default:
          // Fallback to mock generation if no valid provider
          result = generateMockScript(body);
      }
    } catch (error: any) {
      console.error('LLM API error:', error);
      
      // Check if it's an API key error
      if (error.message?.includes('API key')) {
        return NextResponse.json(
          { error: `${LLM_PROVIDER} API error: ${error.message}` },
          { status: 401 }
        );
      }
      
      // General API error
      return NextResponse.json(
        { error: `Error generating script with ${LLM_PROVIDER}: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// OpenAI implementation
async function generateWithOpenAI(data: any) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }
  
  const prompt = createPrompt(data);
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an expert demo script writer for product marketers.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  });
  
  const response = completion.choices[0]?.message?.content || '';
  
  // Parse the response to extract script and talking points
  return parseScriptResponse(response, data);
}

// Anthropic implementation
async function generateWithAnthropic(data: any) {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured');
  }
  
  const prompt = createPrompt(data);
  
  const message = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 4000,
    system: 'You are an expert demo script writer for product marketers.',
    messages: [
      { role: 'user', content: prompt }
    ],
  });
  
  const response = message.content[0]?.text || '';
  
  // Parse the response to extract script and talking points
  return parseScriptResponse(response, data);
}

// Google AI implementation
async function generateWithGoogle(data: any) {
  if (!genAI) {
    throw new Error('Google AI API key not configured');
  }
  
  const prompt = createPrompt(data);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  // Parse the response to extract script and talking points
  return parseScriptResponse(response, data);
}

// Create a standardized prompt for all providers
function createPrompt(data: any) {
  return `
Create a demo script for a product with the following details:

Product Name: ${data.productName}
Target Audience: ${data.audience}
Product Description: ${data.description}
Key Features: ${data.keyFeatures}
Pain Points Addressed: ${data.painPoints}
Tone: ${data.tone || 'professional'}
Format: ${data.format || 'problem-solution'}
Template: ${data.template || 'universal'}
Audience Type: ${data.audienceType || 'mixed'}

Please provide:
1. A detailed script with sections including introduction, problem statement, solution overview, key features, benefits, demonstration, and closing.
2. A condensed version with just the key talking points in bullet format.

Format your response as follows:

## DETAILED_SCRIPT
[Full detailed script here]

## TALKING_POINTS
[Bullet points here]
`;
}

// Parse the LLM response to extract script and talking points
function parseScriptResponse(response: string, data: any) {
  try {
    // Try to extract detailed script and talking points from the response
    const scriptMatch = response.match(/## DETAILED_SCRIPT\s+([\s\S]*?)(?=## TALKING_POINTS|$)/i);
    const pointsMatch = response.match(/## TALKING_POINTS\s+([\s\S]*?)(?=$)/i);
    
    const script = scriptMatch ? scriptMatch[1].trim() : '';
    const talkingPoints = pointsMatch ? pointsMatch[1].trim() : '';
    
    // If we couldn't extract properly, return the full response as the script
    if (!script && !talkingPoints) {
      return {
        script: response,
        talkingPoints: generateFallbackTalkingPoints(data)
      };
    }
    
    return { script, talkingPoints };
  } catch (error) {
    console.error('Error parsing script response:', error);
    // Fallback to returning the full response as the script
    return {
      script: response,
      talkingPoints: generateFallbackTalkingPoints(data)
    };
  }
}

// Generate fallback talking points if parsing fails
function generateFallbackTalkingPoints(data: any) {
  return `• Introduce ${data.productName}
• Mention target audience: ${data.audience}
• Highlight pain points: ${data.painPoints}
• Explain solution: ${data.description}
• Demo key features:
${data.keyFeatures.split(',').map((feature: string) => `  - ${feature.trim()}`).join('\n')}
• Emphasize benefits
• Provide demonstration
• Close and ask for questions`;
}

// Mock function for script generation (used when API keys aren't available)
function generateMockScript(data: any) {
  return {
    script: `# ${data.productName} Demo Script\n\n## Introduction\nHello and welcome! Today I'm excited to show you ${data.productName}, which helps ${data.audience} to solve ${data.painPoints}.\n\n## Problem Statement\n${data.painPoints}\n\n## Solution Overview\n${data.description}\n\n## Key Features\n${data.keyFeatures.split(',').map(feature => `- ${feature.trim()}`).join('\n')}\n\n## Benefits\nBy using ${data.productName}, you'll be able to:\n- Save time and resources\n- Improve efficiency\n- Enhance your overall experience\n\n## Demonstration\nLet me show you how it works...\n\n## Closing\nThank you for your time today. Any questions?`,
    talkingPoints: `• Introduce ${data.productName}\n• Mention target audience: ${data.audience}\n• Highlight pain points: ${data.painPoints}\n• Explain solution: ${data.description}\n• Demo key features:\n${data.keyFeatures.split(',').map(feature => `  - ${feature.trim()}`).join('\n')}\n• Emphasize benefits\n• Provide demonstration\n• Close and ask for questions`
  };
}

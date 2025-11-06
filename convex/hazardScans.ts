/**
 * T095-T096: Hazard Scan Convex Functions
 * AI-powered hazard detection from exposure photos using GPT-4 Vision
 */

import { v } from 'convex/values';
import { action, query, mutation, internalMutation } from './_generated/server';
import { api, internal } from './_generated/api';
import { Id } from './_generated/dataModel';

/**
 * T095: Analyze photo for workplace hazards using AI
 * This is an action because it calls external AI API
 */
export const analyze = action({
  args: {
    photoId: v.id('photos'),
    exposureId: v.id('exposures'),
    photoUrl: v.string(), // Public URL or base64 data URI
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    scanId?: Id<'hazardScans'>;
    detectedHazards?: any[];
    suggestedExposureType?: string | null;
    suggestedPPE?: string[];
    overallAssessment?: string;
    processingTime: number;
    error?: string;
  }> => {
    const startTime = Date.now();

    try {
      // Get OpenAI API key from environment
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY not configured');
      }

      // Call OpenAI GPT-4 Vision API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'system',
              content: `You are a workplace health and safety AI assistant specializing in New Zealand construction sites. Analyze photos to identify workplace hazards and exposure risks.

Your task is to:
1. Identify visible hazards in the photo
2. Classify each hazard by type (silica_dust, asbestos_class_a, asbestos_class_b, welding_fumes, hazardous_chemicals, noise, vibration, heat_stress, cold_exposure, contaminated_soils, lead, confined_space)
3. Provide confidence levels (0.0-1.0) for each detection
4. Suggest appropriate PPE based on hazards
5. Provide brief descriptions of what you detected

Respond with valid JSON only, no markdown formatting:
{
  "hazards": [
    {
      "type": "exposure_type",
      "confidence": 0.85,
      "description": "What you see in the image",
      "boundingBox": null
    }
  ],
  "suggestedExposureType": "most_likely_type_or_null",
  "suggestedPPE": ["P2_RESPIRATOR", "SAFETY_GLASSES", ...],
  "overallAssessment": "Brief summary of hazards present"
}`,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this construction site photo for workplace hazards and exposure risks. Identify any visible hazards.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: args.photoUrl,
                    detail: 'high',
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
          temperature: 0.3, // Lower temperature for more consistent results
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        throw new Error(`AI API failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from AI model');
      }

      // Parse AI response
      let aiResponse;
      try {
        // Remove markdown code blocks if present
        const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        aiResponse = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Invalid AI response format');
      }

      const processingTime = Date.now() - startTime;

      // Get user ID from the exposure
      const exposure = await ctx.runQuery(api.exposures.get, { id: args.exposureId });
      if (!exposure) {
        throw new Error('Exposure not found');
      }

      // Store scan result in database
      const scanId = await ctx.runMutation(internal.hazardScans.createScan, {
        photoId: args.photoId,
        exposureId: args.exposureId,
        userId: exposure.userId,
        detectedHazards: aiResponse.hazards.map((h: any) => ({
          type: h.type,
          confidence: h.confidence,
          boundingBox: h.boundingBox || null,
          description: h.description,
        })),
        suggestedExposureType: aiResponse.suggestedExposureType,
        suggestedPPE: aiResponse.suggestedPPE,
        aiModel: 'gpt-4-vision-preview',
        processingTime,
        userAccepted: null,
        processedAt: Date.now(),
      });

      return {
        success: true,
        scanId,
        detectedHazards: aiResponse.hazards,
        suggestedExposureType: aiResponse.suggestedExposureType,
        suggestedPPE: aiResponse.suggestedPPE,
        overallAssessment: aiResponse.overallAssessment,
        processingTime,
      };
    } catch (error: any) {
      console.error('Hazard scan error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error during hazard scan',
        processingTime: Date.now() - startTime,
      };
    }
  },
});

/**
 * T096: Get hazard scan results for a photo
 */
export const getByPhoto = query({
  args: {
    photoId: v.id('photos'),
  },
  handler: async (ctx, args) => {
    const scan = await ctx.db
      .query('hazardScans')
      .withIndex('by_photoId', q => q.eq('photoId', args.photoId))
      .first();

    return scan;
  },
});

/**
 * Get all hazard scans for an exposure
 */
export const getByExposure = query({
  args: {
    exposureId: v.id('exposures'),
  },
  handler: async (ctx, args) => {
    const scans = await ctx.db
      .query('hazardScans')
      .withIndex('by_exposureId', q => q.eq('exposureId', args.exposureId))
      .collect();

    return scans;
  },
});

/**
 * Internal mutation to create scan result
 * (called from action above)
 */
export const createScan = internalMutation({
  args: {
    photoId: v.id('photos'),
    exposureId: v.id('exposures'),
    userId: v.id('users'),
    detectedHazards: v.array(
      v.object({
        type: v.string(),
        confidence: v.number(),
        boundingBox: v.union(
          v.object({
            x: v.number(),
            y: v.number(),
            width: v.number(),
            height: v.number(),
          }),
          v.null()
        ),
        description: v.string(),
      })
    ),
    suggestedExposureType: v.union(v.string(), v.null()),
    suggestedPPE: v.array(v.string()),
    aiModel: v.string(),
    processingTime: v.number(),
    userAccepted: v.union(v.boolean(), v.null()),
    processedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('hazardScans', args);
  },
});

/**
 * T101: Update user acceptance of AI suggestion
 */
export const updateAcceptance = mutation({
  args: {
    scanId: v.id('hazardScans'),
    accepted: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.scanId, {
      userAccepted: args.accepted,
    });

    return { success: true };
  },
});

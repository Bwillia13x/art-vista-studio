import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are The Bridge Barbershop AI Concierge, an expert assistant for our premium barbershop in Bridgeland, Calgary.

Your role is to help customers with:
1. Booking appointments (guide them through service selection, stylist preferences, and scheduling)
2. Information about services and pricing
3. Stylist information and specialties
4. Shop hours and location
5. General customer inquiries

Shop Information:
- Location: Bridgeland, Calgary
- We offer premium grooming services including haircuts, beard trims, hot towel shaves, and specialized treatments
- All services include premium finishing products and personalized consultation
- We have expert stylists with various specialties

Available Services Context:
${context?.services ? JSON.stringify(context.services, null, 2) : 'Service information not loaded'}

Available Stylists:
${context?.stylists ? JSON.stringify(context.stylists, null, 2) : 'Stylist information not loaded'}

Add-ons Available:
${context?.addOns ? JSON.stringify(context.addOns, null, 2) : 'Add-on information not loaded'}

Communication Style:
- Be professional yet friendly and conversational
- Use Calgary-appropriate language and references
- Show expertise in men's grooming
- Be concise but informative
- Always offer to help book an appointment if relevant
- If a customer wants to book, guide them to use the booking form on the website

Important: You can provide information and guidance, but actual bookings must be completed through our booking system on the website.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please contact us directly.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI service error');
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content;

    if (!aiMessage) {
      throw new Error('No response from AI');
    }

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-concierge:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        fallback: 'I apologize, but I\'m having trouble processing your request. Please call us at (403) XXX-XXXX or visit us in person.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

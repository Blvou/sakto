import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MAX_TEXT_LENGTH = 500;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateRequest {
  messageId?: string;
  text: string;
  targetLang: 'en' | 'tl';
  sourceLang?: 'en' | 'tl';
}

interface TranslateResponse {
  translatedText: string;
  detectedSourceLang: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as TranslateRequest;
    const { messageId, text, targetLang, sourceLang } = body;

    if (!messageId || !text || !targetLang) {
      return new Response(JSON.stringify({ error: 'messageId, text and targetLang are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('id')
      .eq('id', messageId)
      .maybeSingle();

    if (messageError || !message) {
      return new Response(JSON.stringify({ error: 'Message not found' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return new Response(JSON.stringify({ error: `Text exceeds ${MAX_TEXT_LENGTH} characters` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
    if (!apiKey) {
      const detectedSource = sourceLang ?? (targetLang === 'tl' ? 'en' : 'tl');
      const myMemoryTarget = targetLang === 'tl' ? 'fil' : 'en';
      const langPairs = [
        `${detectedSource}|${myMemoryTarget}`,
        `auto|${myMemoryTarget}`,
        `ru|${myMemoryTarget}`,
        `en|${myMemoryTarget}`,
      ];

      for (const langpair of langPairs) {
        const myMemoryUrl =
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
        const myMemoryRes = await fetch(myMemoryUrl);
        if (!myMemoryRes.ok) continue;

        const myMemoryData = await myMemoryRes.json();
        const translatedText = myMemoryData?.responseData?.translatedText?.trim();
        if (translatedText && translatedText.toLowerCase() !== text.trim().toLowerCase()) {
          const [detectedSourceLang] = langpair.split('|');
          const response: TranslateResponse = {
            translatedText,
            detectedSourceLang,
          };
          return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      return new Response(JSON.stringify({ error: 'Translation service not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const googleTarget = targetLang === 'tl' ? 'tl' : 'en';
    const googleSource = sourceLang === 'tl' ? 'tl' : sourceLang === 'en' ? 'en' : undefined;

    const params = new URLSearchParams({
      q: text,
      target: googleTarget,
      format: 'text',
      key: apiKey,
    });
    if (googleSource) params.set('source', googleSource);

    const googleRes = await fetch(
      `https://translation.googleapis.com/language/translate/v2?${params.toString()}`,
      { method: 'POST' }
    );

    if (!googleRes.ok) {
      const errText = await googleRes.text();
      console.error('Google Translate error:', errText);
      return new Response(JSON.stringify({ error: 'Translation failed' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const googleData = await googleRes.json();
    const translation = googleData?.data?.translations?.[0];

    const response: TranslateResponse = {
      translatedText: translation?.translatedText ?? text,
      detectedSourceLang: translation?.detectedSourceLanguage ?? googleSource ?? 'unknown',
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

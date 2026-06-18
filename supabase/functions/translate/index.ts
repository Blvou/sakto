import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  buildLangPairs,
  detectSourceLangCode,
  isSameTranslation,
  isValidMyMemoryResponse,
  type PreferredLang,
} from './_shared/translate-utils.ts';

const MAX_TEXT_LENGTH = 500;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateRequest {
  messageId?: string;
  text: string;
  targetLang: PreferredLang;
}

interface TranslateResponse {
  translatedText: string;
  detectedSourceLang: string;
}

async function translateWithMyMemory(
  text: string,
  targetLang: PreferredLang
): Promise<TranslateResponse | null> {
  const trimmed = text.trim();
  const detected = detectSourceLangCode(trimmed);

  if (targetLang === 'tl' && detected === 'tl') {
    return null;
  }

  const langPairs = buildLangPairs(trimmed, targetLang);

  for (const langpair of langPairs) {
    const myMemoryUrl =
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${langpair}`;
    const myMemoryRes = await fetch(myMemoryUrl);
    if (!myMemoryRes.ok) continue;

    const myMemoryData = await myMemoryRes.json();
    const translatedText = myMemoryData?.responseData?.translatedText?.trim();

    if (
      isValidMyMemoryResponse(myMemoryData?.responseStatus, translatedText) &&
      !isSameTranslation(trimmed, translatedText)
    ) {
      const [detectedSourceLang] = langpair.split('|');
      return { translatedText, detectedSourceLang };
    }
  }

  return null;
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
    const { messageId, text, targetLang } = body;

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
      const myMemoryResult = await translateWithMyMemory(text, targetLang);
      if (myMemoryResult) {
        return new Response(JSON.stringify(myMemoryResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (targetLang === 'tl' && detectSourceLangCode(text) === 'tl') {
        return new Response(JSON.stringify({ error: 'Message is already in Filipino' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Translation service not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const googleTarget = targetLang === 'tl' ? 'tl' : 'en';
    const params = new URLSearchParams({
      q: text,
      target: googleTarget,
      format: 'text',
      key: apiKey,
    });

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
    const translatedText = translation?.translatedText?.trim();

    if (!translatedText || isSameTranslation(text, translatedText)) {
      if (targetLang === 'tl') {
        return new Response(JSON.stringify({ error: 'Message is already in Filipino' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const response: TranslateResponse = {
      translatedText: translatedText ?? text,
      detectedSourceLang: translation?.detectedSourceLanguage ?? 'unknown',
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

import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // ElevenLabs default "Sarah" voice

async function getLatestClonedVoiceId(apiKey: string): Promise<string | null> {
    try {
        const res = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': apiKey },
        });
        const data = await res.json();
        const cloned = data.voices
            ?.filter((v: any) => v.category === 'cloned')
            ?.sort((a: any, b: any) => (b.created_at_unix || 0) - (a.created_at_unix || 0));
        
        if (cloned && cloned.length > 0) {
            console.log('Latest cloned voice:', cloned[0].voice_id, cloned[0].name);
            return cloned[0].voice_id;
        }
        return null;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const { text, voiceId, stability, similarityBoost } = await request.json();
        const apiKey = process.env.ELEVENLABS_API_KEY!;

        // Eğer voiceId gelmediyse, en son klonlanan voice'u kullan
        let useVoiceId = voiceId;
        if (!useVoiceId) {
            console.log('No voiceId provided, checking for latest cloned voice...');
            useVoiceId = await getLatestClonedVoiceId(apiKey);
        }
        
        // Hâlâ yoksa default voice kullan
        if (!useVoiceId) {
            useVoiceId = DEFAULT_VOICE_ID;
        }

        // Klonlanmış voice kontrolü — default olmayan herhangi bir voice
        const isClonedVoice = useVoiceId !== DEFAULT_VOICE_ID;
        const modelId = isClonedVoice ? 'eleven_multilingual_v2' : 'eleven_turbo_v2_5';

        console.log('=== TTS REQUEST ===');
        console.log('Requested voiceId:', voiceId || '(none)');
        console.log('Resolved voiceId:', useVoiceId);
        console.log('Model:', modelId);
        console.log('Is cloned voice:', isClonedVoice);
        console.log('Text length:', text?.length);

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${useVoiceId}`,
            {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    model_id: modelId,
                    voice_settings: {
                        stability: stability || 0.5,
                        similarity_boost: isClonedVoice ? 0.9 : 0.75,
                        style: isClonedVoice ? 0.35 : 0,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('TTS error:', response.status, error);
            return NextResponse.json({ error }, { status: 500 });
        }

        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');

        console.log('✅ TTS success, audio size:', audioBuffer.byteLength, 'bytes');
        console.log('Used voice:', useVoiceId, isClonedVoice ? '(CLONED)' : '(DEFAULT)');

        return NextResponse.json({ audio: base64Audio, usedVoice: useVoiceId, isCloned: isClonedVoice });
    } catch (error) {
        console.error('TTS error:', error);
        return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
    }
}
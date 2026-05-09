import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // ElevenLabs default "Sarah" voice

export async function POST(request: NextRequest) {
    try {
        const { text, voiceId, stability, similarityBoost } = await request.json();

        const useVoiceId = voiceId || DEFAULT_VOICE_ID;
        // Klonlanmış ses için multilingual_v2 daha iyi sonuç verir
        const modelId = voiceId ? 'eleven_multilingual_v2' : 'eleven_turbo_v2_5';

        console.log('=== TTS REQUEST ===');
        console.log('Voice ID:', useVoiceId);
        console.log('Model:', modelId);
        console.log('Is cloned voice:', !!voiceId);
        console.log('Text length:', text?.length);

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${useVoiceId}`,
            {
                method: 'POST',
                headers: {
                    'xi-api-key': process.env.ELEVENLABS_API_KEY!,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    model_id: modelId,
                    voice_settings: {
                        stability: stability || 0.5,
                        similarity_boost: similarityBoost || 0.85,
                        style: voiceId ? 0.3 : 0, // Klonlanmış ses için style ekle
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

        return NextResponse.json({ audio: base64Audio });
    } catch (error) {
        console.error('TTS error:', error);
        return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
    }
}
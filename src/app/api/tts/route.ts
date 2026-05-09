import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { text, voiceId, stability, similarityBoost } = await request.json();

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'EXAVITQu4vr4xnSDxMaL'}`,
            {
                method: 'POST',
                headers: {
                    'xi-api-key': process.env.ELEVENLABS_API_KEY!,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_turbo_v2_5',
                    voice_settings: {
                        stability: stability || 0.5,
                        similarity_boost: similarityBoost || 0.75,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json({ error }, { status: 500 });
        }

        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');

        return NextResponse.json({ audio: base64Audio });
    } catch (error) {
        return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
    }
}
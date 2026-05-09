import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;
        const voiceName = formData.get('name') as string;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        console.log('=== VOICE CLONE REQUEST ===');
        console.log('Audio file type:', audioFile.type);
        console.log('Audio file size:', audioFile.size, 'bytes');
        console.log('Audio file name:', audioFile.name);

        // ElevenLabs Instant Voice Clone — /v1/voices/add
        // Minimum ~10 saniyelik kayıt yeterli (boyut kontrolünü kaldırdık)
        const elevenLabsFormData = new FormData();
        elevenLabsFormData.append('name', voiceName || `EternalEcho-${Date.now()}`);

        // Orijinal ses verisini gönder
        const arrayBuffer = await audioFile.arrayBuffer();
        const originalType = audioFile.type || 'audio/webm';
        const blob = new Blob([arrayBuffer], { type: originalType });

        // ElevenLabs "files" parametresi ile Instant Voice Clone
        elevenLabsFormData.append('files', blob, 'voice_sample.webm');
        elevenLabsFormData.append('description', 'EternalEcho instant voice clone');

        console.log('Sending to ElevenLabs /v1/voices/add...');
        console.log('Blob size:', blob.size, 'type:', blob.type);

        const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY!,
            },
            body: elevenLabsFormData,
        });

        const responseText = await response.text();
        console.log('ElevenLabs response status:', response.status);
        console.log('ElevenLabs response body:', responseText);

        let result;
        try {
            result = JSON.parse(responseText);
        } catch {
            return NextResponse.json({ 
                error: 'Invalid response from ElevenLabs', 
                details: responseText 
            }, { status: 500 });
        }

        if (!response.ok) {
            let userMessage = 'Voice cloning failed.';
            if (response.status === 401) {
                userMessage = 'API key is invalid or voice cloning is not available on your plan.';
            } else if (response.status === 422) {
                userMessage = 'Audio could not be processed. Try recording clearer speech.';
            } else if (result?.detail?.message) {
                userMessage = result.detail.message;
            } else if (result?.detail) {
                userMessage = typeof result.detail === 'string' ? result.detail : JSON.stringify(result.detail);
            }
            console.error('ElevenLabs error:', userMessage);
            return NextResponse.json({ error: userMessage, details: result }, { status: 500 });
        }

        console.log('✅ Voice cloned! voice_id:', result.voice_id);

        return NextResponse.json({
            success: true,
            voiceId: result.voice_id,
        });
    } catch (error) {
        console.error('Clone voice error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
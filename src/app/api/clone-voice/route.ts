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

        // ElevenLabs Instant Voice Clone (IVC)
        // Endpoint: POST /v1/voices/add
        // Requires: multipart/form-data with "files" field containing audio samples
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioBlob = new Blob([arrayBuffer], { type: audioFile.type || 'audio/wav' });

        const elevenLabsFormData = new FormData();
        elevenLabsFormData.append('name', voiceName || `EternalEcho-${Date.now()}`);
        elevenLabsFormData.append('files', audioBlob, audioFile.name || 'voice.wav');
        elevenLabsFormData.append('description', 'EternalEcho instant voice clone');

        // Optional: Add labels for better organization
        elevenLabsFormData.append('labels', JSON.stringify({ app: 'EternalEcho' }));

        console.log('Sending to ElevenLabs /v1/voices/add...');
        console.log('Blob type:', audioBlob.type, 'size:', audioBlob.size);

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
            console.error('Failed to parse ElevenLabs response as JSON');
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
                userMessage = 'Audio could not be processed. Try recording clearer speech for at least 30 seconds.';
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
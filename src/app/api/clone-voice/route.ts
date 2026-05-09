import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;
        const voiceName = formData.get('name') as string;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        console.log('Audio file type:', audioFile.type);
        console.log('Audio file size:', audioFile.size);

        // Minimum dosya boyutu kontrolü (~30 saniyelik kayıt için)
        if (audioFile.size < 50000) {
            return NextResponse.json({
                error: 'Recording too short. Please record at least 30 seconds of speech for voice cloning.',
                code: 'TOO_SHORT'
            }, { status: 400 });
        }

        const elevenLabsFormData = new FormData();
        elevenLabsFormData.append('name', voiceName || 'My Eternal Voice');

        // Orijinal formatı koru — webm olarak gönder, ElevenLabs bunu kabul eder
        const arrayBuffer = await audioFile.arrayBuffer();
        const originalType = audioFile.type || 'audio/webm';
        const extension = originalType.includes('webm') ? 'webm' : originalType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob([arrayBuffer], { type: originalType });
        elevenLabsFormData.append('files', blob, `voice.${extension}`);
        elevenLabsFormData.append('description', 'EternalEcho cloned voice');

        const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY!,
            },
            body: elevenLabsFormData,
        });

        const result = await response.json();
        console.log('ElevenLabs response:', JSON.stringify(result));

        if (!response.ok) {
            // Daha anlaşılır hata mesajları
            let userMessage = 'Voice cloning failed.';
            if (response.status === 401) {
                userMessage = 'API key is invalid or voice cloning is not available on your plan.';
            } else if (response.status === 422) {
                userMessage = 'Audio file could not be processed. Please try recording at least 30 seconds of clear speech.';
            } else if (result?.detail?.message) {
                userMessage = result.detail.message;
            }
            return NextResponse.json({ error: userMessage, details: result }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            voiceId: result.voice_id,
        });
    } catch (error) {
        console.error('Clone voice error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
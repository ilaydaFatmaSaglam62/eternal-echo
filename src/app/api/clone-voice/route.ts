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

        const elevenLabsFormData = new FormData();
        elevenLabsFormData.append('name', voiceName || 'My Eternal Voice');

        // Dosyayı doğru formatla gönder
        const blob = new Blob([await audioFile.arrayBuffer()], { type: 'audio/mpeg' });
        elevenLabsFormData.append('files', blob, 'voice.mp3');
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
            return NextResponse.json({ error: result }, { status: 500 });
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
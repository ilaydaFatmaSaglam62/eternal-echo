import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;
        const voiceName = formData.get('name') as string;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        const elevenLabsFormData = new FormData();
        elevenLabsFormData.append('name', voiceName || 'My Cloned Voice');
        elevenLabsFormData.append('files', audioFile);
        elevenLabsFormData.append('description', 'EternalEcho cloned voice');

        const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY!,
            },
            body: elevenLabsFormData,
        });

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: result }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            voiceId: result.voice_id,
            voiceName: voiceName || 'My Cloned Voice',
        });
    } catch (error) {
        console.error('Clone voice error:', error);
        return NextResponse.json({ error: 'Voice cloning failed' }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';

// Debug endpoint — ElevenLabs hesap durumunu ve mevcut sesleri kontrol et
export async function GET() {
    try {
        const apiKey = process.env.ELEVENLABS_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'ELEVENLABS_API_KEY is not set' }, { status: 500 });
        }

        // 1. Kullanıcı bilgisini al
        const userRes = await fetch('https://api.elevenlabs.io/v1/user', {
            headers: { 'xi-api-key': apiKey },
        });
        const userData = await userRes.json();

        // 2. Mevcut sesleri listele
        const voicesRes = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': apiKey },
        });
        const voicesData = await voicesRes.json();

        // 3. Klonlanmış sesleri filtrele
        const clonedVoices = voicesData.voices?.filter((v: any) => v.category === 'cloned') || [];

        return NextResponse.json({
            success: true,
            user: {
                subscription: userData.subscription?.tier,
                characterCount: userData.subscription?.character_count,
                characterLimit: userData.subscription?.character_limit,
                canClone: userData.subscription?.can_use_instant_voice_cloning,
            },
            totalVoices: voicesData.voices?.length || 0,
            clonedVoices: clonedVoices.map((v: any) => ({
                id: v.voice_id,
                name: v.name,
                category: v.category,
                createdAt: v.created_at_unix,
            })),
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

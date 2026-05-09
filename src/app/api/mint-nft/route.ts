import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('=== MINT BAŞLADI ===');
        console.log('Body:', JSON.stringify(body));
        console.log('API Key var mı:', !!process.env.UNDERDOG_API_KEY);

        const response = await fetch('https://devnet.underdogprotocol.com/v2/projects/1/nfts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.UNDERDOG_API_KEY}`,
            },
            body: JSON.stringify({
                name: body.name,
                description: body.description,
                image: 'https://placehold.co/500x500/7C3AED/white?text=EternalEcho',
                attributes: {
                    audio: body.audioUrl,
                    created: new Date().toISOString(),
                },
                receiverAddress: body.walletAddress,
            }),
        });

        const text = await response.text();
        console.log('=== UNDERDOG CEVABI ===');
        console.log('Status:', response.status);
        console.log('Cevap:', text);

        if (!response.ok) {
            return NextResponse.json({ error: text }, { status: 500 });
        }

        return NextResponse.json({ success: true, nft: JSON.parse(text) });
    } catch (error) {
        console.error('=== HATA ===', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
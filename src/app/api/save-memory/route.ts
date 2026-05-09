import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { title, text, audioUrl, imageUrl, unlockDate, category, walletAddress } = await request.json();

        const memory = {
            id: Date.now().toString(),
            title: title || 'Untitled Memory',
            text,
            audioUrl,
            imageUrl,
            category: category || 'personal',
            walletAddress,
            unlockDate: unlockDate || null,
            createdAt: new Date().toISOString(),
            isLocked: unlockDate ? new Date(unlockDate) > new Date() : false,
        };

        // Pinata'ya metadata olarak kaydet
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.PINATA_JWT}`,
            },
            body: JSON.stringify({
                pinataContent: memory,
                pinataMetadata: {
                    name: `EternalEcho-Memory-${memory.id}`,
                    keyvalues: {
                        walletAddress: walletAddress || 'anonymous',
                        category: memory.category,
                        unlockDate: memory.unlockDate || 'none',
                    },
                },
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: result }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            memory,
            ipfsHash: result.IpfsHash,
            ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        });
    } catch (error) {
        console.error('Save memory error:', error);
        return NextResponse.json({ error: 'Failed to save memory' }, { status: 500 });
    }
}
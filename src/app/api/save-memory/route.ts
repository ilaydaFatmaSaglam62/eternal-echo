import { NextRequest, NextResponse } from 'next/server';

// 4 haneli benzersiz alfanumerik kod üret
function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // karışıklık yaratabilecek 0/O, 1/I/L kaldırıldı
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export async function POST(request: NextRequest) {
    try {
        const { title, text, audioUrl, imageUrl, unlockDate, category, walletAddress } = await request.json();

        const memoryCode = generateCode();

        const memory = {
            id: Date.now().toString(),
            code: memoryCode,
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
                        code: memoryCode,
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
            code: memoryCode,
            ipfsHash: result.IpfsHash,
            ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        });
    } catch (error) {
        console.error('Save memory error:', error);
        return NextResponse.json({ error: 'Failed to save memory' }, { status: 500 });
    }
}
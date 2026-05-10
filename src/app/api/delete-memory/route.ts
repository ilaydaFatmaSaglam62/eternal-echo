import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
    try {
        const { ipfsHash } = await request.json();

        if (!ipfsHash) {
            return NextResponse.json({ error: 'No IPFS hash provided' }, { status: 400 });
        }

        console.log('Deleting pin:', ipfsHash);

        // Pinata'dan pin'i kaldır
        const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${ipfsHash}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${process.env.PINATA_JWT}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Pinata unpin error:', response.status, errorText);
            return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
        }

        console.log('✅ Pin deleted:', ipfsHash);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete memory error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

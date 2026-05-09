import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const name = formData.get('name') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const pinataFormData = new FormData();
        const blob = new Blob([buffer], { type: file.type });
        pinataFormData.append('file', blob, name || 'memory.mp3');

        const metadata = JSON.stringify({ name: name || 'EternalEcho Memory' });
        pinataFormData.append('pinataMetadata', metadata);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PINATA_JWT}`,
            },
            body: pinataFormData,
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json({ error }, { status: 500 });
        }

        const result = await response.json();
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

        return NextResponse.json({ ipfsUrl, hash: result.IpfsHash });
    } catch (error) {
        return NextResponse.json({ error: 'IPFS upload failed' }, { status: 500 });
    }
}
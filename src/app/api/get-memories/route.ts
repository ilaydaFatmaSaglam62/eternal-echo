import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get('walletAddress');
        const category = searchParams.get('category');

        // Pinata'dan anıları getir
        let url = 'https://api.pinata.cloud/data/pinList?status=pinned&metadata[name]=EternalEcho-Memory';

        if (walletAddress) {
            url += `&metadata[keyvalues][walletAddress]={"value":"${walletAddress}","op":"eq"}`;
        }
        if (category) {
            url += `&metadata[keyvalues][category]={"value":"${category}","op":"eq"}`;
        }

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${process.env.PINATA_JWT}`,
            },
        });

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: result }, { status: 500 });
        }

        // Her anının içeriğini getir ve zaman kilidini kontrol et
        const memories = await Promise.all(
            result.rows.map(async (pin: any) => {
                const contentRes = await fetch(
                    `https://gateway.pinata.cloud/ipfs/${pin.ipfs_pin_hash}`
                );
                const memory = await contentRes.json();

                // Zaman kilidi kontrolü
                const isLocked = memory.unlockDate
                    ? new Date(memory.unlockDate) > new Date()
                    : false;

                return {
                    ...memory,
                    isLocked,
                    ipfsHash: pin.ipfs_pin_hash,
                };
            })
        );

        return NextResponse.json({ success: true, memories });
    } catch (error) {
        console.error('Get memories error:', error);
        return NextResponse.json({ error: 'Failed to get memories' }, { status: 500 });
    }
}
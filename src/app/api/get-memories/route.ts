import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get('walletAddress');
        const category = searchParams.get('category');

        // Pinata pinList API — metadata name prefix filter
        const queryParams = new URLSearchParams({
            status: 'pinned',
            pageLimit: '100',
            'metadata[name]': 'EternalEcho-Memory',
        });

        // Wallet ve category filtreleri
        if (walletAddress) {
            queryParams.append(
                'metadata[keyvalues]',
                JSON.stringify({
                    walletAddress: { value: walletAddress, op: 'eq' },
                    ...(category ? { category: { value: category, op: 'eq' } } : {}),
                })
            );
        } else if (category) {
            queryParams.append(
                'metadata[keyvalues]',
                JSON.stringify({
                    category: { value: category, op: 'eq' },
                })
            );
        }

        const url = `https://api.pinata.cloud/data/pinList?${queryParams.toString()}`;
        console.log('Fetching memories from Pinata:', url);

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${process.env.PINATA_JWT}`,
            },
        });

        const result = await response.json();
        console.log('Pinata pinList response - count:', result?.count, 'rows:', result?.rows?.length);

        if (!response.ok) {
            console.error('Pinata pinList error:', JSON.stringify(result));
            return NextResponse.json({ error: result }, { status: 500 });
        }

        if (!result.rows || result.rows.length === 0) {
            console.log('No pinned memories found.');
            return NextResponse.json({ success: true, memories: [] });
        }

        // Her pin'in içeriğini çek
        const memories = await Promise.all(
            result.rows.map(async (pin: any) => {
                try {
                    const contentRes = await fetch(
                        `https://gateway.pinata.cloud/ipfs/${pin.ipfs_pin_hash}`,
                        { signal: AbortSignal.timeout(10000) }
                    );

                    if (!contentRes.ok) {
                        console.error(`Failed to fetch content for ${pin.ipfs_pin_hash}:`, contentRes.status);
                        return null;
                    }

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
                } catch (err) {
                    console.error(`Error fetching memory ${pin.ipfs_pin_hash}:`, err);
                    return null;
                }
            })
        );

        // null olanları filtrele
        const validMemories = memories.filter((m: any) => m !== null);
        console.log('Valid memories fetched:', validMemories.length);

        return NextResponse.json({ success: true, memories: validMemories });
    } catch (error) {
        console.error('Get memories error:', error);
        return NextResponse.json({ error: 'Failed to get memories' }, { status: 500 });
    }
}
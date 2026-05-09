import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        const response = await fetch(
            'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ inputs: text }),
            }
        );

        const result = await response.json();

        // Sonucu ElevenLabs parametrelerine çevir
        const sentimentMap: Record<string, { stability: number; similarityBoost: number }> = {
            positive: { stability: 0.3, similarityBoost: 0.8 },
            negative: { stability: 0.7, similarityBoost: 0.6 },
            neutral: { stability: 0.5, similarityBoost: 0.75 },
        };

        const topLabel = result[0]?.[0]?.label?.toLowerCase() || 'neutral';
        const sentiment = topLabel.includes('pos') ? 'positive'
            : topLabel.includes('neg') ? 'negative'
                : 'neutral';

        return NextResponse.json({
            sentiment,
            voiceSettings: sentimentMap[sentiment],
        });
    } catch (error) {
        return NextResponse.json({
            sentiment: 'neutral',
            voiceSettings: { stability: 0.5, similarityBoost: 0.75 },
        });
    }
}
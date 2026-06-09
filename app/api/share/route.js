import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { videoId, platform } = body;

        if (!videoId) {
            return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
        }

        // Simulating database operation
        console.log(`[Database Mock] Share tracked for video: ${videoId} on platform: ${platform || 'native_share'}`);
        
        return NextResponse.json({ success: true, message: 'Share tracked successfully' });

    } catch (error) {
        console.error('Backend /share Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
// app/api/like/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { videoId } = body;
        //receiving user's ip
        const userIp = request.headers.get('x-forwarded-for') || 'Unknown IP';
        if (!videoId) {
            return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
        }
        // Simulating the database operation as we don't have a real db right now
        console.log(`[Database Mock] Like recorded for video: ${videoId} from IP: ${userIp}`);
        
        return NextResponse.json({ success: true, message: 'Like count updated' });

    } catch (error) {
        console.error('Backend /like Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
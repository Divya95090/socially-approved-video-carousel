import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const TARGET_COUNT = 45;
        const generatedDataset = [];

        // A small array of topics to make the titles look somewhat realistic
        const topics = [
            "Morning Routine", "Tech Review", "Nature Walk", 
            "City Vibes", "Daily Vlog", "Setup Tour", 
            "Fitness Goals", "Cooking Hacks"
        ];

        for (let i = 0; i < TARGET_COUNT; i++) {
            const randomTopic = topics[i % topics.length];
            
            generatedDataset.push({
                // Unique ID for React rendering
                id: `vid_${i+1}`,
                
                title: `${randomTopic}`,
                description: `This is a cute cat video. Showcasing the best of ${randomTopic.toLowerCase()}.`,
                videoUrl: "https://lorem.video/cat_128kbps",
                // Set to 0 so the frontend can handle the incrementing logic
                likes: 0,
                comments: 0,
                shares: 0
            });
        }

        return NextResponse.json(generatedDataset);

    } catch (error) {
        console.error('Error generating video dataset:', error);
        return NextResponse.json(
            { error: 'Failed to generate video data' }, 
            { status: 500 }
        );
    }
}


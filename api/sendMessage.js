
import Pusher from "pusher";

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const { message, username } = req.body;
    if (!message || !username) {
        res.status(400).json({ error: 'Message and username are required' }); 
        return;
    }
    // Trigger a Pusher event
    try {
        await pusher.trigger("chat", "new-message", {
            message,
            username,
            timestamp: new Date().toISOString()
        });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// VTC Capacitación - ElevenLabs Agent Handler
// Backend integration for Convai API

const axios = require('axios');

const ELEVENLABS_CONFIG = {
    agentId: process.env.ELEVENLABS_AGENT_ID || 'agent_5701kr0h5gg6eetb69tv6c5hwfj1',
    apiKey: process.env.ELEVENLABS_API_KEY,
    baseUrl: 'https://api.elevenlabs.io/v1'
};

/**
 * Handler for POST /api/elevenlabs-agent
 * Sends user message to ElevenLabs Convai agent
 */
async function handleElevenLabsAgent(req, res) {
    try {
        const { message, agentId, userId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message required' });
        }

        const finalAgentId = agentId || ELEVENLABS_CONFIG.agentId;

        // Call ElevenLabs Convai API
        const response = await axios.post(
            `${ELEVENLABS_CONFIG.baseUrl}/convai/agents/${finalAgentId}/messages`,
            {
                message: message,
                user_id: userId || 'anonymous',
                conversation_id: generateConversationId(userId)
            },
            {
                headers: {
                    'xi-api-key': ELEVENLABS_CONFIG.apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            agentResponse: response.data
        });

    } catch (error) {
        console.error('ElevenLabs API Error:', error.message);
        res.status(500).json({
            error: 'Failed to communicate with agent',
            details: error.message
        });
    }
}

/**
 * WebSocket handler for real-time Convai streaming
 */
function handleWebSocketAgent(ws, message) {
    const { text, userId, agentId } = JSON.parse(message);

    const elevenLabsWs = new WebSocket(
        `wss://api.elevenlabs.io/v1/convai/agents/${agentId}/websocket`,
        {
            headers: {
                'xi-api-key': ELEVENLABS_CONFIG.apiKey
            }
        }
    );

    elevenLabsWs.onopen = () => {
        elevenLabsWs.send(JSON.stringify({
            type: 'user_message',
            message: text,
            user_id: userId
        }));
    };

    elevenLabsWs.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            // Forward agent response to client
            ws.send(JSON.stringify({
                type: 'agent_response',
                data: data
            }));

            // Handle audio stream if present
            if (data.audio) {
                ws.send(JSON.stringify({
                    type: 'audio_chunk',
                    audio: data.audio
                }));
            }

        } catch (e) {
            console.error('WebSocket parsing error:', e);
        }
    };

    elevenLabsWs.onerror = (error) => {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Agent connection error'
        }));
    };

    elevenLabsWs.onclose = () => {
        ws.send(JSON.stringify({
            type: 'connection_closed'
        }));
    };
}

/**
 * Generate or retrieve conversation ID for user session
 */
function generateConversationId(userId) {
    // In production, store this in Redis or database
    return `conv_${userId}_${Date.now()}`;
}

module.exports = {
    handleElevenLabsAgent,
    handleWebSocketAgent
};

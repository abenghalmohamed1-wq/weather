/**
 * PHASE 2: OpenAI Service
 * Handles OpenAI API calls with multi-tool function calling
 */

import { OpenAI } from 'openai';
import {
    getCurrentAndForecastWeather,
    getHistoricalWeather,
} from './weatherService.js';
import { SearchHistory } from '../models/index.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// FUNCTION DEFINITIONS FOR OPENAI
// ============================================================================

const tools = [
    {
        type: 'function',
        function: {
            name: 'get_current_and_forecast_weather',
            description:
                'Get current weather and 5-day forecast for a specific location. Use this when user asks about today, tomorrow, or the upcoming week.',
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description:
                            'The city and optionally country/state, e.g., "Paris, France", "New York, USA", or "Tokyo"',
                    },
                },
                required: ['location'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_historical_weather',
            description:
                'Get historical weather data for a specific past date and location. Use when user asks about weather on a specific date in the past.',
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'The city and optionally country, e.g., "Paris, France"',
                    },
                    date: {
                        type: 'string',
                        description:
                            'The date in YYYY-MM-DD format. Examples: "2023-01-15", "2024-12-25". Must be a date in the past within the last 5 years.',
                    },
                },
                required: ['location', 'date'],
            },
        },
    },
];

// ============================================================================
// TOOL EXECUTION
// ============================================================================

async function executeTool(toolName, toolInput) {
    console.log(`Executing tool: ${toolName} with input:`, toolInput);

    switch (toolName) {
        case 'get_current_and_forecast_weather':
            return await getCurrentAndForecastWeather(toolInput.location);
        case 'get_historical_weather':
            return await getHistoricalWeather(toolInput.location, toolInput.date);
        default:
            return { error: `Unknown tool: ${toolName}`, data: null };
    }
}

// ============================================================================
// MULTILINGUAL TRANSLATIONS
// ============================================================================

const systemPrompts = {
    en: `You are a friendly and knowledgeable weather assistant. You help users understand weather patterns, forecasts, and historical weather data.

Key instructions:
- Always use the provided function tools to fetch real, current weather data. Never make up weather information.
- When a user asks about weather without specifying a location, ask for clarification about which city they mean.
- Format weather information clearly with temperatures in Celsius, humidity as percentages, wind speeds in m/s.
- Provide helpful context like "good weather for outdoor activities" or "might want to bring an umbrella."
- Be conversational and friendly in your responses.
- If a tool returns an error, explain it clearly to the user and suggest alternatives.`,

    fr: `Vous êtes un assistant météo amical et compétent. Vous aidez les utilisateurs à comprendre les conditions météorologiques, les prévisions et les données météorologiques historiques.

Instructions clés:
- Utilisez toujours les outils de fonction fournis pour récupérer les données météorologiques réelles et actuelles. Ne inventez jamais d'informations météorologiques.
- Quand un utilisateur demande la météo sans spécifier d'emplacement, demandez une clarification sur la ville concernée.
- Formatez les informations météorologiques clairement avec les températures en Celsius, l'humidité en pourcentages, les vitesses de vent en m/s.
- Fournissez un contexte utile comme "bon temps pour les activités de plein air" ou "vous voudrez peut-être apporter un parapluie."
- Soyez conversationnel et amical dans vos réponses.
- Si un outil renvoie une erreur, expliquez-la clairement à l'utilisateur et suggérez des alternatives.`,

    ar: `أنت مساعد طقس ودود وعارف. تساعد المستخدمين على فهم أنماط الطقس والتنبؤات وبيانات الطقس التاريخية.

التعليمات الرئيسية:
- استخدم دائماً أدوات الوظائف المتوفرة للحصول على بيانات طقس حقيقية وحالية. لا تختلق أبداً معلومات طقس.
- عندما يسأل المستخدم عن الطقس دون تحديد موقع، اطلب توضيحاً حول المدينة التي يقصدها.
- قم بتنسيق المعلومات الجوية بوضوح مع درجات حرارة بالدرجة المئوية والرطوبة بنسب مئوية وسرعات الرياح بالمتر/الثانية.
- قدم السياق المفيد مثل "طقس جيد للأنشطة الخارجية" أو "قد تريد إحضار مظلة."
- كن ودياً ومحادثة في ردودك.
- إذا أرجعت الأداة خطأ، اشرحها بوضوح للمستخدم واقترح بدائل.`,

    darija: `أنت مساعد طقس ودود وعارف. تساعد الناس فهم الطقس والتنبؤات والبيانات القديمة.

التعليمات الساسية:
- استعمل دايماً الأدوات ديالك باش تجيب معلومات الطقس الحقيقية. ما تختلقش معلومات الطقس أبداً.
- إذا سوالك شي واحد على الطقس بدون تحديد الجوج، سولو وينو بقا يقصد.
- قول المعلومات بشي طريقة واضحة: درجة الحرارة بالسيليسيوس، الرطوبة بالنسبة المئوية.
- كون صديق وحنون فشي الردود ديالك.
- إذا كاينة مشكلة، قول للناس واش صار وشنو الحل.`,
};

// ============================================================================
// MAIN CHAT FUNCTION WITH FUNCTION CALLING
// ============================================================================

export async function chat(userMessage, conversationHistory = [], language = 'en', sessionId = null) {
    try {
        // Prepare messages
        const systemPrompt = systemPrompts[language] || systemPrompts.en;

        const messages = [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...conversationHistory,
            {
                role: 'user',
                content: userMessage,
            },
        ];

        let response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages,
            tools,
            tool_choice: 'auto',
            temperature: 0.7,
            max_tokens: 2000,
        });

        // Process tool calls in a loop until no more tools are called
        let toolCallsMade = false;

        while (response.choices[0].finish_reason === 'tool_calls') {
            toolCallsMade = true;
            const toolCalls = response.choices[0].message.tool_calls;

            // Add assistant's tool-calling message to history
            messages.push({
                role: 'assistant',
                content: response.choices[0].message.content,
                tool_calls: toolCalls,
            });

            // Execute all tool calls
            const toolResults = [];
            for (const toolCall of toolCalls) {
                console.log(`Processing tool call: ${toolCall.function.name}`);
                const result = await executeTool(
                    toolCall.function.name,
                    JSON.parse(toolCall.function.arguments)
                );

                toolResults.push({
                    role: 'user',
                    content: JSON.stringify(result),
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                });
            }

            // Add tool results to messages
            messages.push(...toolResults);

            // Get next response from OpenAI
            response = await openai.chat.completions.create({
                model: 'gpt-4-turbo',
                messages,
                tools,
                tool_choice: 'auto',
                temperature: 0.7,
                max_tokens: 2000,
            });
        }

        // Extract final response text
        const finalResponse =
            response.choices[0].message.content || 'I could not generate a response.';

        // Add new turn to conversation history
        const updatedHistory = [...messages];

        // Save to search history if sessionId provided
        if (sessionId && toolCallsMade) {
            try {
                // Extract tool information
                let queryType = 'current';
                let queryLocation = '';
                let queryDate = '';

                for (const msg of messages) {
                    if (msg.tool_calls) {
                        for (const toolCall of msg.tool_calls) {
                            if (toolCall.function.name === 'get_current_and_forecast_weather') {
                                queryType = 'current';
                                queryLocation = JSON.parse(toolCall.function.arguments).location;
                            } else if (toolCall.function.name === 'get_historical_weather') {
                                queryType = 'historical';
                                const args = JSON.parse(toolCall.function.arguments);
                                queryLocation = args.location;
                                queryDate = args.date;
                            }
                        }
                    }
                }

                await SearchHistory.create({
                    sessionId,
                    userMessage,
                    assistantResponse: finalResponse,
                    location: queryLocation,
                    queryType,
                    queryDate,
                    language,
                });
            } catch (err) {
                console.error('Error saving search history:', err.message);
            }
        }

        return {
            success: true,
            message: finalResponse,
            conversationHistory: updatedHistory,
            toolsCalled: toolCallsMade,
        };
    } catch (error) {
        console.error('Chat error:', error.message);
        return {
            success: false,
            message:
                'Sorry, I encountered an error processing your request. Please try again.',
            error: error.message,
            conversationHistory,
        };
    }
}

// Export tools for documentation
export { tools };
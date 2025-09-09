using CitizenConcernAPI.Models;
using Microsoft.AspNetCore.Http.Json;
using Newtonsoft.Json;
using OpenAI.Chat;

namespace CitizenConcernAPI.Services
{
    public class OpenAPIAIService : IAIService
    {
        private readonly ILogger<AIService> _logger;
        private readonly ChatClient _chatClient;
        private List<ChatMessage> _baseMessages;
        private ChatCompletionOptions _options;
        private readonly string _openAIApiKey;
        string model = "gpt-4o-mini";

        public OpenAPIAIService(ILogger<AIService> logger)
        {
            _openAIApiKey = Environment.GetEnvironmentVariable("OpenAI-ApiKey")!;
            _chatClient = new ChatClient(model: model, apiKey: _openAIApiKey);
            _logger = logger;
        }

        public void ConcernClassifier()
        {
            // Put your full instruction once here (system message)
            string systemPrompt = """
                You are an AI assistant that classifies citizen concerns into predefined categories,
                analyzes sentiment, urgency, and maps concerns to UN Sustainable Development Goals (SDGs).
                Always respond in strict JSON format.

                Categories and their keywords:
                - Roads: road, street, pothole, traffic, signal, pavement, highway, bridge
                - Water: water, supply, leak, pipe, drainage, sewage, tap, shortage
                - Electricity: electricity, power, outage, voltage, transformer, cable, meter, billing
                - Health: health, hospital, medical, doctor, medicine, clinic, ambulance, disease
                - Sanitation: garbage, waste, cleaning, toilet, sanitation, hygiene, dump, bin
                - Environment: pollution, air, noise, tree, park, environment, green, clean
                - Transport: bus, transport, vehicle, parking, station, metro, auto, rickshaw
                - Education: school, education, teacher, student, books, building, playground, library
                - Safety: safety, crime, security, police, theft, violence, danger, protection
                - Housing: housing, home, building, construction, apartment, slum, rent, maintenance

                Tasks:
                1. Classify into one category above.
                2. Give a sentimentScore between -1.0 (max negative) and 1.0 (max positive).
                3. Give a priority between 0 (not urgent) and 5 (extremely urgent).
                4. Map to the name (only name and not the number) of most relevant UN SDG (see https://sdgs.un.org/goals).
                5. List the keywords from the input that helped classification.

                Output must match the JSON schema provided by the API (no extra text).
                """;

            // Keep system message in base messages (we reuse this per call)
            _baseMessages = new List<ChatMessage> { new SystemChatMessage(systemPrompt) };

            // JSON schema to force strict structured output (the model will return JSON)
            var jsonSchema = """
            {
              "type": "object",
              "properties": {
                "category": { "type": "string" },
                "sentimentScore": { "type": "number" },
                "priority": { "type": "integer" },
                "sdgGoal": { "type": "string" },
                "keywords": { "type": "array", "items": { "type": "string" } }
              },
              "required": ["category", "sentimentScore", "priority", "sdgGoal", "keywords"],
              "additionalProperties": false
            }
            """;

            _options = new ChatCompletionOptions
            {
                // Ask the SDK to enforce the JSON schema format in the response
                ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                    jsonSchemaFormatName: "classification_result",
                    jsonSchema: BinaryData.FromString(jsonSchema),
                    jsonSchemaIsStrict: true)
            };
        }

        public async Task<ClassificationResult> ClassifyConcernAsync(string title, string description)
        {
            ConcernClassifier();
            var userInput = $"Title: {title}\nDescription: {description}";

            // Build messages: system (from constructor) + this request's user message
            var messages = new List<ChatMessage>(_baseMessages)
            {
                new UserChatMessage(userInput)
            };

            // Call the model with messages + options
            ChatCompletion completion = await _chatClient.CompleteChatAsync(messages, _options);

            // The SDK returns model output in completion.Content[0].Text
            string json = completion.Content?[0].Text ?? throw new InvalidOperationException("Empty model response");

            // Deserialize into the strong type (case-insensitive)
            var result = JsonConvert.DeserializeObject<ClassificationResult>(json);
            return result!;
        }
        public async Task<string> CategorizeConcernAsync(string title, string description)
        {
            // throw non implemented exception
            throw new NotImplementedException();
        }

        public async Task<int> PrioritizeConcernAsync(Concern concern)
        {
            throw new NotImplementedException();
        }

        public async Task<double> AnalyzeSentimentAsync(string text)
        {
            throw new NotImplementedException();
        }

        public async Task<List<string>> ExtractKeywordsAsync(string text)
        {
            throw new NotImplementedException();
        }
    }
}
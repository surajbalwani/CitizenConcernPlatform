using CitizenConcernAPI.Models;
using System.Text.RegularExpressions;
using System.Text.Json;
using OpenAI.Chat;
using Newtonsoft.Json;

namespace CitizenConcernAPI.Services
{
    public class OpenAPIAIService : IAIService
    {
        private readonly ILogger<AIService> _logger;

        private readonly Dictionary<string, List<string>> _categoryKeywords = new()
        {
            { "Roads", new List<string> { "road", "street", "pothole", "traffic", "signal", "pavement", "highway", "bridge" } },
            { "Water", new List<string> { "water", "supply", "leak", "pipe", "drainage", "sewage", "tap", "shortage" } },
            { "Electricity", new List<string> { "electricity", "power", "outage", "voltage", "transformer", "cable", "meter", "billing" } },
            { "Health", new List<string> { "health", "hospital", "medical", "doctor", "medicine", "clinic", "ambulance", "disease" } },
            { "Sanitation", new List<string> { "garbage", "waste", "cleaning", "toilet", "sanitation", "hygiene", "dump", "bin" } },
            { "Environment", new List<string> { "pollution", "air", "noise", "tree", "park", "environment", "green", "clean" } },
            { "Transport", new List<string> { "bus", "transport", "vehicle", "parking", "station", "metro", "auto", "rickshaw" } },
            { "Education", new List<string> { "school", "education", "teacher", "student", "books", "building", "playground", "library" } },
            { "Safety", new List<string> { "safety", "crime", "security", "police", "theft", "violence", "danger", "protection" } },
            { "Housing", new List<string> { "housing", "home", "building", "construction", "apartment", "slum", "rent", "maintenance" } }
        };

        public OpenAPIAIService(ILogger<AIService> logger)
        {
            _logger = logger;
        }

        public async Task<string> CategorizeConcernAsync(string title, string description)
        {
            try
            {
                var text = $"{title} {description}".ToLower();
                var scores = new Dictionary<string, int>();

                foreach (var category in _categoryKeywords)
                {
                    var score = 0;
                    foreach (var keyword in category.Value)
                    {
                        var matches = Regex.Matches(text, $@"\b{keyword}\b", RegexOptions.IgnoreCase);
                        score += matches.Count;
                    }
                    scores[category.Key] = score;
                }

                var bestCategory = scores.OrderByDescending(x => x.Value).FirstOrDefault();

                return bestCategory.Value > 0 ? bestCategory.Key : "General";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error categorizing concern");
                return "General";
            }
        }

        public async Task<int> PrioritizeConcernAsync(Concern concern)
        {
            try
            {
                var priorityScore = 3;

                var urgentKeywords = new[] { "urgent", "emergency", "immediate", "critical", "danger", "life", "death", "fire", "accident" };
                var text = $"{concern.Title} {concern.Description}".ToLower();

                var hasUrgentKeywords = urgentKeywords.Any(keyword => text.Contains(keyword));
                if (hasUrgentKeywords) priorityScore = 5;

                if (concern.UpVotes > 10) priorityScore = Math.Max(priorityScore, 4);
                if (concern.UpVotes > 50) priorityScore = 5;

                if (concern.Category == "Health" || concern.Category == "Safety")
                    priorityScore = Math.Max(priorityScore, 4);

                var sentimentScore = await AnalyzeSentimentAsync(text);
                if (sentimentScore < -0.5) priorityScore = Math.Max(priorityScore, 4);

                return Math.Min(5, priorityScore);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error prioritizing concern");
                return 3;
            }
        }

        public async Task<double> AnalyzeSentimentAsync(string text)
        {
            try
            {
                var positiveWords = new[] { "good", "great", "excellent", "amazing", "wonderful", "fantastic", "awesome", "perfect", "love", "like", "happy", "satisfied" };
                var negativeWords = new[] { "bad", "terrible", "awful", "horrible", "disgusting", "hate", "angry", "frustrated", "disappointed", "sad", "poor", "worst" };

                var words = text.ToLower().Split(new[] { ' ', '.', ',', '!', '?' }, StringSplitOptions.RemoveEmptyEntries);

                var positiveScore = words.Count(word => positiveWords.Contains(word));
                var negativeScore = words.Count(word => negativeWords.Contains(word));

                var totalWords = Math.Max(words.Length, 1);
                var sentiment = (positiveScore - negativeScore) / (double)totalWords;

                return Math.Max(-1.0, Math.Min(1.0, sentiment));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing sentiment");
                return 0.0;
            }
        }

        public async Task<List<string>> ExtractKeywordsAsync(string text)
        {
            try
            {
                var words = text.ToLower()
                    .Split(new[] { ' ', '.', ',', '!', '?', ';', ':', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries)
                    .Where(word => word.Length > 3)
                    .Where(word => !IsStopWord(word))
                    .GroupBy(word => word)
                    .OrderByDescending(g => g.Count())
                    .Take(10)
                    .Select(g => g.Key)
                    .ToList();

                return words;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting keywords");
                return new List<string>();
            }
        }

        private bool IsStopWord(string word)
        {
            var stopWords = new HashSet<string>
            {
                "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
                "this", "that", "these", "those", "is", "are", "was", "were", "be", "been", "have", "has", "had"
            };
            return stopWords.Contains(word);
        }

        public ClassificationResult ClassifyConcernAsync(string title, string description)
        {
            var prompt = $@"
                You are a classification assistant.

                categories:
                divide into the catgories defined in sustainable development goals specified by UN,
                can be found on https://sdgs.un.org/goals

                Task:
                - Classify the following concern into one category above.
                - Give a sentiment score between -1.0 (max negative sentiment) and 1.0 (max positive sentiment).
                - Give a priority between 0 (not urgent) and 5 (extremely urgent).
                - List of all the keywords that helped the concern classify into a category.

                Concern:
                Title: {title}
                Description: {description}

                Respond ONLY in JSON format:
                {{
                    ""category"": ""one of the categories"",
                    ""sentiment"": floating point numbet between -1.0 to 1.0,
                    ""priority"": number 1-5,
                    ""keywords"": [""list"", ""of"", ""keywords""]
                }}
                ";
            ChatClient client = new(
                model: "gpt-5",
                apiKey: "<OpenAI-ApiKey>"
            );

            ChatCompletion completion = client.CompleteChat(prompt);
            Console.WriteLine($"[ASSISTANT]: {completion.Content[0].Text}");
            ClassificationResult result = JsonConvert.DeserializeObject<ClassificationResult>(completion.Content[0].Text)!;

            return result;
        }
    }

}
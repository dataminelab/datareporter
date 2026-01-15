/**
 * AI Provider Factory
 * Creates the appropriate AI provider based on the selected model type
 */
import OpenAIProvider from "./OpenAIProvider";
import DeepSeekProvider from "./DeepSeekProvider";
import GeminiProvider from "./GeminiProvider";

function getAIProvider(modelType, dashboardId) {
    const providers = {
        chatgpt: OpenAIProvider,
        deepseek: DeepSeekProvider,
        gemini: GeminiProvider,
    };

    const ProviderClass = providers[modelType];
    if (!ProviderClass) {
        throw new Error(`Unknown AI provider: ${modelType}`);
    }

    return new ProviderClass(dashboardId);
}

export default getAIProvider;

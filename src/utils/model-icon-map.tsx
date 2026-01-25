/**
 * Comprehensive mapping of LLM model names to their respective icon files
 * Covers modern models from 2024 onwards across all major providers
 */

// Helper function to get the icon path for a model
export function getModelIcon(modelName: string): string {
  if (!modelName || typeof modelName !== 'string') {
    return '/llmmodel/placeholder.svg';
  }

  const normalizedName = modelName.toLowerCase().trim();

  // OpenAI Models
  if (
    normalizedName.includes('gpt-4o') ||
    normalizedName.includes('gpt4o') ||
    normalizedName.includes('gpt-4-turbo') ||
    normalizedName.includes('gpt4-turbo') ||
    normalizedName.includes('gpt-4') ||
    normalizedName.includes('gpt4') ||
    normalizedName.includes('gpt-3.5') ||
    normalizedName.includes('gpt35') ||
    normalizedName === 'o1-preview' ||
    normalizedName === 'o1' ||
    normalizedName.includes('openai')
  ) {
    return '/llmmodel/openai-gpt.svg';
  }

  // Anthropic Claude Models
  if (
    normalizedName.includes('claude-3.5') ||
    normalizedName.includes('claude35') ||
    normalizedName.includes('claude-3') ||
    normalizedName.includes('claude3') ||
    normalizedName.includes('claude-2') ||
    normalizedName.includes('claude2') ||
    normalizedName.includes('claude-1') ||
    normalizedName.includes('claude1') ||
    normalizedName.includes('claude') ||
    normalizedName.includes('anthropic')
  ) {
    return '/llmmodel/anthropic-claude.svg';
  }

  // Google Gemini Models
  if (
    normalizedName.includes('gemini-1.5') ||
    normalizedName.includes('gemini15') ||
    normalizedName.includes('gemini-1') ||
    normalizedName.includes('gemini1') ||
    normalizedName.includes('gemini-pro') ||
    normalizedName.includes('gemini-pro-') ||
    normalizedName.includes('gemini') ||
    normalizedName.includes('google') ||
    normalizedName.includes('bard') ||
    normalizedName.includes('palm')
  ) {
    return '/llmmodel/gemini-google.svg';
  }

  // Mistral Models
  if (
    normalizedName.includes('mistral-large') ||
    normalizedName.includes('mistral-medium') ||
    normalizedName.includes('mistral-small') ||
    normalizedName.includes('mistral-7b') ||
    normalizedName.includes('mistral-8x7b') ||
    normalizedName.includes('mistral-8x22b') ||
    normalizedName.includes('mistral') ||
    normalizedName.includes('mixtral')
  ) {
    return '/llmmodel/mistral.svg';
  }

  // Cohere Models
  if (
    normalizedName.includes('command-r') ||
    normalizedName.includes('command-r-plus') ||
    normalizedName.includes('command-r-plus-08-2024') ||
    normalizedName.includes('command') ||
    normalizedName.includes('cohere')
  ) {
    return '/llmmodel/cohere.svg';
  }

  // Groq Models
  if (
    normalizedName.includes('llama-3.1') ||
    normalizedName.includes('llama-3') ||
    normalizedName.includes('llama2') ||
    normalizedName.includes('llama-2') ||
    normalizedName.includes('llama') ||
    normalizedName.includes('mixtral') ||
    normalizedName.includes('groq')
  ) {
    return '/llmmodel/groq.svg';
  }

  // Meta Llama Models
  if (
    normalizedName.includes('llama-3.1') ||
    normalizedName.includes('llama-3') ||
    normalizedName.includes('llama-2') ||
    normalizedName.includes('llama2') ||
    normalizedName.includes('llama') ||
    normalizedName.includes('meta') ||
    normalizedName.includes('meta-llama')
  ) {
    return '/llmmodel/placeholder.svg'; // Meta Llama doesn't have a dedicated icon yet
  }

  // OpenRouter (Provider)
  if (
    normalizedName.includes('openrouter') ||
    normalizedName.includes('open-router')
  ) {
    return '/llmmodel/openrouter.svg';
  }

  // HuggingFace Models
  if (
    normalizedName.includes('huggingface') ||
    normalizedName.includes('hf-') ||
    normalizedName.includes('hf ') ||
    normalizedName.includes(' transformers')
  ) {
    return '/llmmodel/huggingface.svg';
  }

  // DeepSeek Models
  if (
    normalizedName.includes('deepseek-v2') ||
    normalizedName.includes('deepseek-v3') ||
    normalizedName.includes('deepseek-coder') ||
    normalizedName.includes('deepseek-reasoner') ||
    normalizedName.includes('deepseek')
  ) {
    return '/llmmodel/deepseek.svg';
  }

  // Qwen (Alibaba) Models
  if (
    normalizedName.includes('qwen-2.5') ||
    normalizedName.includes('qwen2.5') ||
    normalizedName.includes('qwen-2') ||
    normalizedName.includes('qwen2') ||
    normalizedName.includes('qwen-max') ||
    normalizedName.includes('qwen') ||
    normalizedName.includes('alibaba')
  ) {
    return '/llmmodel/qwen.svg';
  }

  // Hunyuan (Tencent) Models
  if (
    normalizedName.includes('hunyuan-') ||
    normalizedName.includes('hunyuan') ||
    normalizedName.includes('混元') ||
    normalizedName.includes('tencent')
  ) {
    return '/llmmodel/hunyuan.svg';
  }

  // Kimi (Moonshot AI) Models
  if (
    normalizedName.includes('kimi-') ||
    normalizedName.includes('kimi') ||
    normalizedName.includes('moonshot') ||
    normalizedName.includes('月之暗面')
  ) {
    return '/llmmodel/kimi.svg';
  }

  // Grok (xAI) Models
  if (
    normalizedName.includes('grok-beta') ||
    normalizedName.includes('grok-2') ||
    normalizedName.includes('grok') ||
    normalizedName.includes('xai')
  ) {
    return '/llmmodel/grok.svg';
  }

  // Perplexity Models
  if (
    normalizedName.includes('perplexity') ||
    normalizedName.includes('pplx')
  ) {
    return '/llmmodel/perplexity.svg';
  }

  // Jina AI Models
  if (
    normalizedName.includes('jina-') ||
    normalizedName.includes('jina') ||
    normalizedName.includes('jinaai')
  ) {
    return '/llmmodel/jina.svg';
  }

  // Grok (X Platform)
  if (
    normalizedName.includes('grok') &&
    !normalizedName.includes('deepseek') &&
    !normalizedName.includes('qwen')
  ) {
    return '/llmmodel/grok.svg';
  }

  // Longcat Models (Isomorphic Labs)
  if (
    normalizedName.includes('longcat') ||
    normalizedName.includes('long-cat') ||
    normalizedName.includes('isomorphic')
  ) {
    return '/llmmodel/longcat.svg';
  }

  // GLM (Zhipu AI) Models
  if (
    normalizedName.includes('glm-4') ||
    normalizedName.includes('glm4') ||
    normalizedName.includes('glm') ||
    normalizedName.includes('zhipu') ||
    normalizedName.includes('智谱') ||
    normalizedName.includes('chatglm')
  ) {
    return '/llmmodel/zai-z-ai-glm.svg';
  }

  // Ollama (Local LLM Provider)
  if (
    normalizedName.includes('ollama') ||
    normalizedName.includes('llama.cpp') ||
    normalizedName.includes('local-llm') ||
    normalizedName.includes('local llm')
  ) {
    return '/llmmodel/ollama.svg';
  }

  // LlamaIndex Models
  if (
    normalizedName.includes('llamaindex') ||
    normalizedName.includes('llama-index') ||
    normalizedName === 'llamaindex'
  ) {
    return '/llmmodel/llamaindex.svg';
  }

  // Default fallback for unknown models
  return '/llmmodel/placeholder.svg';
}

/**
 * Get the model provider name from the model string
 */
export function getModelProvider(modelName: string): string {
  if (!modelName || typeof modelName !== 'string') {
    return 'Unknown';
  }

  const normalizedName = modelName.toLowerCase().trim();

  if (normalizedName.includes('openai') || normalizedName.includes('gpt')) {
    return 'OpenAI';
  }

  if (normalizedName.includes('anthropic') || normalizedName.includes('claude')) {
    return 'Anthropic';
  }

  if (normalizedName.includes('google') || normalizedName.includes('gemini')) {
    return 'Google';
  }

  if (normalizedName.includes('mistral') || normalizedName.includes('mixtral')) {
    return 'Mistral AI';
  }

  if (normalizedName.includes('cohere')) {
    return 'Cohere';
  }

  if (normalizedName.includes('groq')) {
    return 'Groq';
  }

  if (normalizedName.includes('meta') || normalizedName.includes('llama')) {
    return 'Meta';
  }

  if (normalizedName.includes('deepseek')) {
    return 'DeepSeek';
  }

  if (normalizedName.includes('qwen') || normalizedName.includes('alibaba')) {
    return 'Alibaba (Qwen)';
  }

  if (normalizedName.includes('hunyuan') || normalizedName.includes('tencent')) {
    return 'Tencent (Hunyuan)';
  }

  if (normalizedName.includes('kimi') || normalizedName.includes('moonshot')) {
    return 'Moonshot AI (Kimi)';
  }

  if (normalizedName.includes('grok') || normalizedName.includes('xai')) {
    return 'xAI (Grok)';
  }

  if (normalizedName.includes('openrouter')) {
    return 'OpenRouter';
  }

  return 'Unknown';
}

/**
 * React component for displaying model icon with name
 */
interface ModelDisplayProps {
  modelName: string;
  className?: string;
}

export function ModelDisplay({ modelName, className }: ModelDisplayProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className || ''}`}>
      <img
        src={getModelIcon(modelName)}
        alt={getModelProvider(modelName)}
        className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/llmmodel/placeholder.svg';
        }}
      />
      <span className="text-xs sm:text-sm break-words">{modelName}</span>
    </span>
  );
}

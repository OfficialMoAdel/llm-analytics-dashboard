/**
 * Test file to verify model icon mapping functionality
 * Run this to test various model names and their expected icons
 */

import { getModelIcon, getModelProvider } from "./model-icon-map";

interface TestCase {
  input: string;
  expectedProvider: string;
  description?: string;
}

const testCases: TestCase[] = [
  // OpenAI Models
  { input: "gpt-4o", expectedProvider: "OpenAI", description: "Latest GPT-4o model" },
  { input: "gpt4o", expectedProvider: "OpenAI", description: "GPT-4o without dashes" },
  { input: "gpt-4-turbo", expectedProvider: "OpenAI", description: "GPT-4 Turbo" },
  { input: "gpt-4", expectedProvider: "OpenAI", description: "Standard GPT-4" },
  { input: "gpt-3.5-turbo", expectedProvider: "OpenAI", description: "GPT-3.5 Turbo" },
  { input: "o1-preview", expectedProvider: "OpenAI", description: "OpenAI O1 preview" },
  { input: "o1", expectedProvider: "OpenAI", description: "OpenAI O1" },

  // Anthropic Claude Models
  { input: "claude-3-5-sonnet-20241022", expectedProvider: "Anthropic", description: "Claude 3.5 Sonnet" },
  { input: "claude-3-opus", expectedProvider: "Anthropic", description: "Claude 3 Opus" },
  { input: "claude-3-sonnet", expectedProvider: "Anthropic", description: "Claude 3 Sonnet" },
  { input: "claude-3-haiku", expectedProvider: "Anthropic", description: "Claude 3 Haiku" },
  { input: "claude-2-1", expectedProvider: "Anthropic", description: "Claude 2.1" },
  { input: "claude-2", expectedProvider: "Anthropic", description: "Claude 2" },
  { input: "claude-1-5-sonnet", expectedProvider: "Anthropic", description: "Claude 1.5 Sonnet" },

  // Google Gemini Models
  { input: "gemini-1.5-pro", expectedProvider: "Google", description: "Gemini 1.5 Pro" },
  { input: "gemini-1.5-flash", expectedProvider: "Google", description: "Gemini 1.5 Flash" },
  { input: "gemini-pro", expectedProvider: "Google", description: "Gemini Pro" },
  { input: "gemini-1.0-pro", expectedProvider: "Google", description: "Gemini 1.0 Pro" },
  { input: "gemini-pro-002", expectedProvider: "Google", description: "Gemini Pro 002" },

  // Meta Llama Models
  { input: "llama-3.1-405b", expectedProvider: "Meta", description: "Llama 3.1 405B" },
  { input: "llama-3.1-70b", expectedProvider: "Meta", description: "Llama 3.1 70B" },
  { input: "llama-3.1-8b", expectedProvider: "Meta", description: "Llama 3.1 8B" },
  { input: "llama-3-70b", expectedProvider: "Meta", description: "Llama 3 70B" },
  { input: "llama-3-8b", expectedProvider: "Meta", description: "Llama 3 8B" },
  { input: "llama-2-70b", expectedProvider: "Meta", description: "Llama 2 70B" },
  { input: "llama-2-7b", expectedProvider: "Meta", description: "Llama 2 7B" },

  // Mistral Models
  { input: "mistral-large-2", expectedProvider: "Mistral AI", description: "Mistral Large 2" },
  { input: "mistral-medium-3", expectedProvider: "Mistral AI", description: "Mistral Medium 3" },
  { input: "mistral-small-3", expectedProvider: "Mistral AI", description: "Mistral Small 3" },
  { input: "mistral-7b-instruct", expectedProvider: "Mistral AI", description: "Mistral 7B Instruct" },
  { input: "mixtral-8x7b-instruct", expectedProvider: "Mistral AI", description: "Mixtral 8x7B" },
  { input: "mixtral-8x22b", expectedProvider: "Mistral AI", description: "Mixtral 8x22B" },

  // Cohere Models
  { input: "command-r-plus-08-2024", expectedProvider: "Cohere", description: "Command R+ 08-2024" },
  { input: "command-r-plus", expectedProvider: "Cohere", description: "Command R+" },
  { input: "command-r", expectedProvider: "Cohere", description: "Command R" },

  // Groq Models
  { input: "llama-3.1-70b-versatile", expectedProvider: "Groq", description: "Llama 3.1 via Groq" },
  { input: "llama-3.1-8b-instant", expectedProvider: "Groq", description: "Llama 3.1 Instant via Groq" },
  { input: "mixtral-8x7b-32768", expectedProvider: "Groq", description: "Mixtral via Groq" },

  // DeepSeek Models
  { input: "deepseek-v3", expectedProvider: "DeepSeek", description: "DeepSeek V3" },
  { input: "deepseek-v2.5", expectedProvider: "DeepSeek", description: "DeepSeek V2.5" },
  { input: "deepseek-v2", expectedProvider: "DeepSeek", description: "DeepSeek V2" },
  { input: "deepseek-coder-v2", expectedProvider: "DeepSeek", description: "DeepSeek Coder V2" },
  { input: "deepseek-reasoner", expectedProvider: "DeepSeek", description: "DeepSeek Reasoner" },

  // Qwen (Alibaba) Models
  { input: "qwen-2.5-max", expectedProvider: "Alibaba (Qwen)", description: "Qwen 2.5 Max" },
  { input: "qwen-2.5-turbo", expectedProvider: "Alibaba (Qwen)", description: "Qwen 2.5 Turbo" },
  { input: "qwen-2.5-plus", expectedProvider: "Alibaba (Qwen)", description: "Qwen 2.5 Plus" },
  { input: "qwen-2-max", expectedProvider: "Alibaba (Qwen)", description: "Qwen 2 Max" },
  { input: "qwen-turbo", expectedProvider: "Alibaba (Qwen)", description: "Qwen Turbo" },

  // Hunyuan (Tencent) Models
  { input: "hunyuan-lite", expectedProvider: "Tencent (Hunyuan)", description: "Hunyuan Lite" },
  { input: "hunyuan-standard", expectedProvider: "Tencent (Hunyuan)", description: "Hunyuan Standard" },
  { input: "hunyuan-pro", expectedProvider: "Tencent (Hunyuan)", description: "Hunyuan Pro" },

  // Kimi (Moonshot AI) Models
  { input: "kimi-k1", expectedProvider: "Moonshot AI (Kimi)", description: "Kimi K1" },
  { input: "kimi-k1-pro", expectedProvider: "Moonshot AI (Kimi)", description: "Kimi K1 Pro" },

  // Grok (xAI) Models
  { input: "grok-beta", expectedProvider: "xAI (Grok)", description: "Grok Beta" },
  { input: "grok-2-beta", expectedProvider: "xAI (Grok)", description: "Grok 2 Beta" },

  // OpenRouter (Aggregator)
  { input: "openrouter/auto", expectedProvider: "OpenRouter", description: "OpenRouter Auto" },
  { input: "openrouter", expectedProvider: "OpenRouter", description: "OpenRouter Provider" },

  // HuggingFace
  { input: "huggingface/meta-llama", expectedProvider: "HuggingFace", description: "HuggingFace Hub" },
  { input: "hf:microsoft/DialoGPT", expectedProvider: "HuggingFace", description: "HF Model" },

  // Perplexity
  { input: "pplx-7b-online", expectedProvider: "Perplexity", description: "Perplexity Online" },
  { input: "perplexity/sonnet", expectedProvider: "Perplexity", description: "Perplexity Sonnet" },

  // Jina AI
  { input: "jina-embeddings-v3", expectedProvider: "Jina AI", description: "Jina Embeddings V3" },
  { input: "jina-reranker-v2", expectedProvider: "Jina AI", description: "Jina Reranker V2" },

  // Longcat
  { input: "longcat-v1", expectedProvider: "Isomorphic Labs (Longcat)", description: "Longcat V1" },

  // GLM (Zhipu AI)
  { input: "glm-4-plus", expectedProvider: "Zhipu AI", description: "GLM 4 Plus" },
  { input: "glm-4-air", expectedProvider: "Zhipu AI", description: "GLM 4 Air" },
  { input: "chatglm-4", expectedProvider: "Zhipu AI", description: "ChatGLM 4" },

  // Ollama (Local)
  { input: "ollama/llama3", expectedProvider: "Ollama", description: "Local Llama via Ollama" },
  { input: "local-llm", expectedProvider: "Ollama", description: "Local LLM" },

  // Edge cases
  { input: "", expectedProvider: "Unknown", description: "Empty string" },
  { input: "completely-unknown-model-xyz", expectedProvider: "Unknown", description: "Unknown model" },
  { input: "gpt-999", expectedProvider: "Unknown", description: "Non-existent model" },
];

export function runModelIconTests(): void {
  console.log("=".repeat(80));
  console.log("LLM Model Icon Mapping Test Suite");
  console.log("=".repeat(80));
  console.log("");

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    const provider = getModelProvider(testCase.input);
    const icon = getModelIcon(testCase.input);
    const passedTest = provider === testCase.expectedProvider;

    if (passedTest) {
      passed++;
      console.log(`✓ Test ${index + 1}: ${testCase.input}`);
    } else {
      failed++;
      console.log(`✗ Test ${index + 1}: ${testCase.input}`);
      console.log(`  Expected: ${testCase.expectedProvider}`);
      console.log(`  Got:      ${provider}`);
    }

    console.log(`  Provider: ${provider}`);
    console.log(`  Icon:     ${icon}`);
    if (testCase.description) {
      console.log(`  Desc:     ${testCase.description}`);
    }
    console.log("");
  });

  console.log("=".repeat(80));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  console.log("=".repeat(80));
}

export function testSpecificModel(modelName: string): void {
  console.log("\n" + "=".repeat(80));
  console.log(`Testing Model: "${modelName}"`);
  console.log("=".repeat(80));

  const provider = getModelProvider(modelName);
  const icon = getModelIcon(modelName);

  console.log(`Provider: ${provider}`);
  console.log(`Icon Path: ${icon}`);
  console.log(`Icon File: ${icon.split('/').pop()}`);
  console.log("=".repeat(80) + "\n");
}

// Export test cases for use in components
export { testCases };

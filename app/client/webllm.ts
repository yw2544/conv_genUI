"use client";
import { useEffect, useState } from "react";
import { useAppConfig } from "../store";
import log from "loglevel";
import { createContext } from "react";
import {
  InitProgressReport,
  prebuiltAppConfig,
  ChatCompletionMessageParam,
  ServiceWorkerMLCEngine,
  ChatCompletionChunk,
  ChatCompletion,
  WebWorkerMLCEngine,
  CompletionUsage,
  ChatCompletionFinishReason,
} from "@mlc-ai/web-llm";

import {
  ChatOptions,
  LLMApi,
  LLMConfig,
  RequestMessage,
  fetchOpenAI,
} from "./api";
import { LogLevel } from "@mlc-ai/web-llm";
import { fixMessage } from "../utils";
import { OpenAI_Api } from "./openai";
import { DEFAULT_MODELS } from "../constant";
import { config } from "process";

export function useWebLLMApi() {
  const { modelConfig, selectModel } = useAppConfig();
  const [webllmApi, setWebllmApi] = useState<WebLLMApi | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      log.warn("Skipping WebLLMApi initialization in SSR.");
      return;
    }

    log.info("当前模型:", modelConfig.model);

    // **如果当前 modelConfig.model 为空，设定默认模型 gpt-4o**
    if (!modelConfig.model || modelConfig.model === "") {
      selectModel("gpt-4o");
      log.info("default model: gpt-4o");
    }

    // **初始化 WebLLMApi**
    const webllmInstance = new WebLLMApi("webWorker");
    setWebllmApi(webllmInstance);
  }, [modelConfig.model]);

  return webllmApi;
}
const KEEP_ALIVE_INTERVAL = 5_000;

type ServiceWorkerWebLLMHandler = {
  type: "serviceWorker";
  engine: ServiceWorkerMLCEngine;
};

type WebWorkerWebLLMHandler = {
  type: "webWorker";
  engine: WebWorkerMLCEngine;
};

type WebLLMHandler = ServiceWorkerWebLLMHandler | WebWorkerWebLLMHandler;

export class WebLLMApi implements LLMApi {
  private llmConfig?: LLMConfig;
  private initialized = false;
  private openai = new OpenAI_Api();
  webllm!: WebLLMHandler;

  constructor(
    type: "serviceWorker" | "webWorker",
    logLevel: LogLevel = "WARN",
  ) {
    const engineConfig = {
      appConfig: {
        ...prebuiltAppConfig,
        useIndexedDBCache: this.llmConfig?.cache === "index_db",
      },
      logLevel,
    };

    if (typeof window !== "undefined") {
      // ✅ 只在浏览器端执行
      if (type === "serviceWorker") {
        log.info("Create ServiceWorkerMLCEngine");
        this.webllm = {
          type: "serviceWorker",
          engine: new ServiceWorkerMLCEngine(engineConfig, KEEP_ALIVE_INTERVAL),
        };
      } else {
        log.info("Create WebWorkerMLCEngine");
        this.webllm = {
          type: "webWorker",
          engine: new WebWorkerMLCEngine(
            new Worker(new URL("../worker/web-worker.ts", import.meta.url), {
              type: "module",
            }),
            engineConfig,
          ),
        };
      }
    } else {
      console.warn("Skipping WebWorkerMLCEngine initialization in SSR.");
    }
  }

  private async initModel(onUpdate?: (message: string, chunk: string) => void) {
    if (!this.llmConfig) {
      console.error("❌ llmConfig is undefined in initModel");
      throw new Error("llmConfig is undefined");
    }

    if (typeof this.llmConfig.model !== "string") {
      console.error("❌ llmConfig.model is not a string:", this.llmConfig);
      throw new Error("Invalid llmConfig: model is not a string");
    }

    if (this.llmConfig.model.startsWith("gpt")) {
      console.warn("Skipping model initialization for OpenAI models.");
      return;
    }
    this.webllm.engine.setInitProgressCallback((report: InitProgressReport) => {
      onUpdate?.(report.text, report.text);
    });
    await this.webllm.engine.reload(this.llmConfig.model, this.llmConfig);
    this.initialized = true;
  }

  // async chat(options: ChatOptions): Promise<void> {
  //   if (!this.initialized || this.isDifferentConfig(options.config)) {
  //     this.llmConfig = { ...(this.llmConfig || {}), ...options.config };
  //     try {
  //       await this.initModel(options.onUpdate);
  //     } catch (err: any) {
  //       let errorMessage = err.message || err.toString() || "";
  //       if (errorMessage === "[object Object]") {
  //         errorMessage = JSON.stringify(err);
  //       }
  //       console.error("Error while initializing the model", errorMessage);
  //       options?.onError?.(errorMessage);
  //       return;
  //     }
  //   }
  async chat(options: ChatOptions): Promise<void> {
    if (options.config.model.startsWith("gpt")) {
      console.log("🚀 use OpenAI:", options.config.model);
      try {
        await this.openai.chat(options);
      } catch (error) {
        console.error("❌ OpenAI API Error:", error);
        options.onError?.(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
      return;
    }

    if (!options.config.model.startsWith("gpt") && !this.initialized) {
      await this.initModel();
    }

    const messages = options.messages;

    if (
      !messages ||
      !messages.length ||
      !messages[messages.length - 1]?.content
    ) {
      throw new Error("Invalid message content");
    }

    const content = messages[messages.length - 1].content;

    let reply: string | null = "";
    let stopReason: ChatCompletionFinishReason | undefined;
    let usage: CompletionUsage | undefined;
    try {
      const completion = await this.chatCompletion(
        !!options.config.stream,
        messages,
        options.onUpdate,
      );
      reply = completion.content;
      stopReason = completion.stopReason;
      usage = completion.usage;
    } catch (err: any) {
      let errorMessage = err.message || err.toString() || "";
      if (errorMessage === "[object Object]") {
        log.error(JSON.stringify(err));
        errorMessage = JSON.stringify(err);
      }
      console.error("Error in chatCompletion", errorMessage);
      if (
        errorMessage.includes("WebGPU") &&
        errorMessage.includes("compatibility chart")
      ) {
        // Add WebGPU compatibility chart link
        errorMessage = errorMessage.replace(
          "compatibility chart",
          "[compatibility chart](https://caniuse.com/webgpu)",
        );
      }
      options.onError?.(errorMessage);
      return;
    }

    if (reply) {
      reply = fixMessage(reply);
      options.onFinish?.(reply, stopReason, usage);
    } else {
      options.onError?.(new Error("Empty response generated by LLM"));
    }
  }

  async abort() {
    await this.webllm.engine?.interruptGenerate();
  }

  private isDifferentConfig(config: LLMConfig): boolean {
    if (!this.llmConfig) {
      return true;
    }

    // Compare required fields
    if (this.llmConfig.model !== config.model) {
      return true;
    }

    // Compare optional fields
    const optionalFields: (keyof LLMConfig)[] = [
      "temperature",
      "context_window_size",
      "top_p",
      "stream",
      "presence_penalty",
      "frequency_penalty",
    ];

    for (const field of optionalFields) {
      if (
        this.llmConfig[field] !== undefined &&
        config[field] !== undefined &&
        config[field] !== config[field]
      ) {
        return true;
      }
    }

    return false;
  }

  async chatCompletion(
    stream: boolean,
    messages: RequestMessage[],
    onUpdate?: (
      message: string,
      chunk: string,
      usage?: CompletionUsage,
    ) => void,
  ) {
    const completion = await this.webllm.engine.chatCompletion({
      stream: stream,
      messages: messages as ChatCompletionMessageParam[],
      ...(stream ? { stream_options: { include_usage: true } } : {}),
    });

    if (stream) {
      let content: string | null = "";
      let stopReason: ChatCompletionFinishReason | undefined;
      let usage: CompletionUsage | undefined;
      const asyncGenerator = completion as AsyncIterable<ChatCompletionChunk>;
      for await (const chunk of asyncGenerator) {
        if (chunk.choices[0]?.delta.content) {
          content += chunk.choices[0].delta.content;
          onUpdate?.(content, chunk.choices[0].delta.content);
        }
        if (chunk.usage) {
          usage = chunk.usage;
        }
        if (chunk.choices[0]?.finish_reason) {
          stopReason = chunk.choices[0].finish_reason;
        }
      }
      return { content, stopReason, usage };
    }

    const chatCompletion = completion as ChatCompletion;
    return {
      content: chatCompletion.choices[0].message.content,
      stopReason: chatCompletion.choices[0].finish_reason,
      usage: chatCompletion.usage,
    };
  }

  async models() {
    return DEFAULT_MODELS;
  }

  // async shouldShowMap(userInput: string): Promise<boolean> {
  //   const response = await this.callAnotherLLM(userInput);
  //   return response.includes("show map");
  // }

  // private async callAnotherLLM(input: string): Promise<string> {
  //    const msg = await this.openai.chat({
  //      messages: [{ role: "user", content: "Your task is to analyze each user message and determine whether it requires the use of a map to assist in providing an answer. If the message indicates a need for a map, respond with 'show map'. If a map is not necessary, respond with 'no'. Your responses should be concise and strictly limited to either 'show map' or 'no'." },
  //        { role: "user", content: input },
  //      ],
  //      config: LLMApi
  //    });
  //    log.info(msg);
  //    return msg.content[0].type;
  // }
}

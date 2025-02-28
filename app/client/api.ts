import { ChatCompletionFinishReason, CompletionUsage } from "@mlc-ai/web-llm";
import { CacheType, Model } from "../store";
import { ModelFamily } from "../constant";
import Locale from "../locales";
import fs from "fs";
import path from "path";

export const ROLES = ["system", "user", "assistant"] as const;

export type MessageRole = (typeof ROLES)[number];

export const Models = ["gpt-3.5-turbo", "gpt-4", "gpt-4o"] as const;

export type ChatModel = Model;

export interface MultimodalContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
  dimension?: {
    width: number;
    height: number;
  };
}

export interface RequestMessage {
  role: MessageRole;
  content: string | MultimodalContent[];
}

export interface LLMConfig {
  model: string;
  cache: CacheType;
  temperature?: number;
  context_window_size?: number;
  top_p?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface ChatOptions {
  messages: RequestMessage[];
  config: LLMConfig;

  if_agent?: boolean;

  onAgent?: (message: string) => void;
  onUpdate?: (message: string, chunk: string) => void;
  onFinish?: (
    message: string,
    stopReason?: ChatCompletionFinishReason,
    usage?: CompletionUsage,
  ) => void;
  onError?: (err: Error) => void;
}

export async function fetchOpenAI(
  messages: RequestMessage[],
  config: LLMConfig,
) {
  const response = await fetch("https://xiaoai.plus/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer sk-GTubjBIrqUVOqm8D01KwgIdYzoov0gfUnSzXNVZ3E5P4y5p5`, // ✅ 使用环境变量存储 API Key
    },
    body: JSON.stringify({
      model: config.model, // 选择 OpenAI 模型
      messages: messages,
      temperature: config.temperature || 0.7,
      stream: false,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
  const data = await response.json();
  console.log("✅ API Response:", data);
  return data;
  // const reply = data.choices?.[0]?.message?.content || "No response received";
  // console.log("✅ API Response:", reply);
  // return reply;
}

export interface LLMUsage {
  used: number;
  total: number;
}

export interface ModelRecord {
  name: string;
  display_name: string;
  provider?: string;
  size?: string;
  quantization?: string;
  family: ModelFamily;
  recommended_config?: {
    temperature?: number;
    context_window_size?: number;
    top_p?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
  };
}

export abstract class LLMApi {
  abstract chat(options: ChatOptions): Promise<void>;
  abstract abort(): Promise<void>;
  abstract models(): Promise<ModelRecord[] | Model[]>;
}

function parseBankData() {
  const data = fs.readFileSync(
    path.join(__dirname, "../../public/bank_data.txt"),
    "utf-8",
  );
  return data
    .split("\n")
    .map((line) => {
      if (!line.trim()) return null;
      const [account, name, product, date, balance] = line.split(",");
      return { account, name, product, date, balance };
    })
    .filter((row) => row !== null);
}

async function fetchBankData() {
  try {
    const response = await fetch("/bank_data.txt");
    const data = await response.text();
    return data
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [account, name, product, date, balance] = line.split(",");
        return { account, name, product, date, balance };
      });
  } catch (error) {
    console.error("Error fetching bank data:", error);
    return [];
  }
}

export async function processGPTResponse(response: string) {
  console.log("[DEBUG] Processing GPT response:", response);

  const processedResponse: any = {
    content: response,
  };

  // 检查是否包含股票格式
  const stockMatch = response.match(/(.*)\_stock\_([A-Z]+)\_([a-z0-9]+)$/);
  console.log("[DEBUG] Stock match result:", stockMatch);

  if (stockMatch) {
    console.log("[STOCK] Detected stock pattern in response:", stockMatch);
    const [fullMatch, content, stockSymbol, stockInterval] = stockMatch;
    processedResponse.content = content.trim(); // 去除标记和多余空格
    processedResponse.showStock = true;
    processedResponse.stockSymbol = stockSymbol;
    processedResponse.stockInterval = stockInterval;
    console.log(
      "[STOCK] Extracted stock info:",
      processedResponse.stockSymbol,
      processedResponse.stockInterval,
    );
  }

  // 检查是否是 hotel 响应 - 把 hotel 匹配放在最前面
  const hotelMatch = response.match(
    /(.+)\.\_hotel\_\_(\d{4}-\d{2}-\d{2})\_\_(\d{4}-\d{2}-\d{2})\_\_(.+)/,
  );
  if (hotelMatch) {
    const [_, content, checkIn, checkOut, location] = hotelMatch;
    const template = Locale.Store.Prompt.hotelHTML_template;
    const hotelHtml = template
      .replace(/CHECK_IN_DATE/g, checkIn)
      .replace(/CHECK_OUT_DATE/g, checkOut)
      .replace(/LOCATION/g, location.replace(/_/g, " "));

    processedResponse.showHotel = true;
    processedResponse.hotelData = hotelHtml;
    processedResponse.showFlight = false;
    processedResponse.flightData = "";
    processedResponse.showMap = false;
    processedResponse.mapdata = "";
    processedResponse.showBank = false;
    processedResponse.bankData = "";
    processedResponse.showCalendar = false;
    processedResponse.calendarData = "";
    processedResponse.showCalculator = false;
  }

  // 检查是否是 flight 响应
  const flightMatch = response.match(
    /(.+)\.\_flight\_\_(.+)\_\_(.+)\_\_(\d{4}-\d{2}-\d{2})/,
  );
  if (flightMatch) {
    const [_, content, departureAirport, arrivalAirport, date] = flightMatch;
    const template = Locale.Store.Prompt.flightHTML_template;
    const flightHtml = template
      .replace(/DEPARTURE_AIRPORT/g, departureAirport)
      .replace(/ARRIVAL_AIRPORT/g, arrivalAirport)
      .replace(/DEPARTURE_DATE/g, date);

    processedResponse.showFlight = true;
    processedResponse.flightData = flightHtml;
    processedResponse.showMap = false;
    processedResponse.mapdata = "";
    processedResponse.showBank = false;
    processedResponse.bankData = "";
    processedResponse.showCalendar = false;
    processedResponse.calendarData = "";
    processedResponse.showCalculator = false;
    processedResponse.showHotel = false;
    processedResponse.hotelData = "";
  }

  const mapMatch = response.match(/(.+)\.\_map\_(.+)/);
  if (mapMatch) {
    const [_, content, locationString] = mapMatch;
    const locations = locationString
      .split("__")
      .map((loc) => loc.replace(/_/g, " "));

    const template = Locale.Store.Prompt.mapHTML_template;
    const mapHtml = template.replace(
      "LOCATIONS_ARRAY",
      JSON.stringify(locations),
    );

    processedResponse.showMap = true;
    processedResponse.mapdata = mapHtml;
    processedResponse.showBank = false;
    processedResponse.bankData = "";
    processedResponse.showCalendar = false;
    processedResponse.calendarData = "";
    processedResponse.showCalculator = false;
    processedResponse.showFlight = false;
    processedResponse.flightData = "";
    processedResponse.showHotel = false;
    processedResponse.hotelData = "";
  }

  // 检查是否是银行响应
  const bankMatch = response.match(/(.+)\.\_bank/);
  if (bankMatch) {
    console.log("Bank match found");
    const [_, content] = bankMatch;

    const bankData = await fetchBankData();
    console.log("Bank data:", bankData);

    let tableRows = bankData
      .map(
        (row) => `
      <tr>
        <td><strong>${row.name}</strong></td>
        <td>${row.account}</td>
        <td>${row.product}</td>
        <td>${row.date}</td>
        <td style="color: ${parseFloat(row.balance) < 0 ? "red" : "green"};">
          $${parseFloat(row.balance).toLocaleString()}
        </td>
      </tr>
    `,
      )
      .join("");

    console.log("Table rows:", tableRows);

    const template = Locale.Store.Prompt.bankHTML_template;
    const bankHtml = template.replace("BANK_DATA_ROWS", tableRows);

    console.log("Final HTML:", bankHtml);

    processedResponse.showBank = true;
    processedResponse.bankData = bankHtml;
    processedResponse.showMap = false;
    processedResponse.mapdata = "";
    processedResponse.showCalendar = false;
    processedResponse.calendarData = "";
    processedResponse.showCalculator = false;
    processedResponse.showFlight = false;
    processedResponse.flightData = "";
    processedResponse.showHotel = false;
    processedResponse.hotelData = "";
  }

  // 检查是否是日历响应
  const calendarMatch = response.match(/(.+)\.\_calendar\_(\d{4}-\d{2}-\d{2})/);
  if (calendarMatch) {
    const [_, content, date] = calendarMatch;
    const template = Locale.Store.Prompt.calendarHTML_template;
    processedResponse.showMap = false;
    processedResponse.mapdata = "";
    processedResponse.showCalendar = true;
    processedResponse.showCalculator = false;
    processedResponse.calendarData = template
      ? template.replace(/TARGET_DATE/g, date)
      : "";
    processedResponse.calculatorData = "";
    processedResponse.showFlight = false;
    processedResponse.flightData = "";
    processedResponse.showHotel = false;
    processedResponse.hotelData = "";
  }

  // 检查是否是计算器响应
  const calculatorMatch = response.match(/(.+)\.\_calculator/);
  console.log("Calculator match:", calculatorMatch); // 添加调试日志

  if (calculatorMatch) {
    const [_, content] = calculatorMatch;
    processedResponse.showMap = false;
    processedResponse.mapdata = "";
    processedResponse.showCalendar = false;
    processedResponse.showCalculator = true;
    processedResponse.calendarData = "";
    processedResponse.calculatorData = "";
    processedResponse.showFlight = false;
    processedResponse.flightData = "";
    processedResponse.showHotel = false;
    processedResponse.hotelData = "";
  }

  console.log("[DEBUG] Final processed response:", processedResponse);
  return processedResponse;
}

// 添加股票数据获取函数
export async function fetchStockData(symbol: string) {
  try {
    const response = await fetch(
      `https://api.marketdata.app/v1/stocks/quotes/${symbol}`,
      {
        headers: {
          "X-RapidAPI-Key":
            "73832acacdmsh912a5ba144580abp1e7c32jsn8690baeaba73",
          "X-RapidAPI-Host": "marketdata.app",
        },
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return { error: "Failed to fetch stock data" };
  }
}

export class OpenAI_Api implements LLMApi {
  async chat(options: ChatOptions): Promise<void> {
    const { messages, config, onUpdate, onFinish, onError } = options;

    try {
      // 如果是流式响应
      if (config.stream) {
        const controller = new AbortController();
        this.controller = controller;
        const signal = controller.signal;

        try {
          const response = await fetch(
            "https://xiaoai.plus/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer sk-GTubjBIrqUVOqm8D01KwgIdYzoov0gfUnSzXNVZ3E5P4y5p5`,
              },
              body: JSON.stringify({
                model: config.model,
                messages: messages,
                temperature: config.temperature || 0.7,
                stream: true,
              }),
              signal,
            },
          );

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error("[API] OpenAI API error:", error);
            throw new Error(`OpenAI API error: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("Failed to get response reader");
          }

          let responseText = "";
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("[API] Stream complete");
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk
              .split("\n")
              .filter(
                (line) => line.trim() !== "" && line.trim() !== "data: [DONE]",
              );

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;

              const data = line.slice(6);
              if (data === "[DONE]") {
                console.log("[API] Received [DONE] signal");
                break;
              }

              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content || "";
                if (content) {
                  responseText += content;
                  onUpdate?.(responseText, content);
                }
              } catch (e) {
                console.error("[API] Error parsing JSON:", e);
              }
            }
          }

          console.log(
            "[API] Calling onFinish with response:",
            responseText.substring(0, 100) + "...",
          );
          onFinish?.(responseText, "stop", undefined);
        } catch (error) {
          if (signal.aborted) {
            console.log("[API] Request aborted");
            return;
          }
          console.error("[API] Error in stream:", error);
          onError?.(error as Error);
        }
      } else {
        // 非流式响应
        try {
          const data = await fetchOpenAI(messages, config);
          const reply =
            data.choices?.[0]?.message?.content || "No response received";
          onFinish?.(reply, data.choices?.[0]?.finish_reason, data.usage);
        } catch (error) {
          console.error("[API] Error in non-stream:", error);
          onError?.(error as Error);
        }
      }
    } catch (error) {
      console.error("[API] Unexpected error:", error);
      onError?.(error as Error);
    }
  }

  async abort(): Promise<void> {
    if (this.controller) {
      this.controller.abort();
      this.controller = undefined;
    }
  }

  async models(): Promise<ModelRecord[] | Model[]> {
    return [
      {
        name: "gpt-3.5-turbo",
        display_name: "GPT-3.5",
        provider: "OpenAI",
        family: ModelFamily.OPENAI,
      },
      {
        name: "gpt-4",
        display_name: "GPT-4",
        provider: "OpenAI",
        family: ModelFamily.OPENAI,
      },
      {
        name: "gpt-4o",
        display_name: "GPT-4o",
        provider: "OpenAI",
        family: ModelFamily.OPENAI,
      },
    ];
  }

  private controller?: AbortController;
}

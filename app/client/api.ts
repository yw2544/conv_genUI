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

    return {
      content,
      showHotel: true,
      hotelData: hotelHtml,
      showFlight: false,
      flightData: "",
      showMap: false,
      mapdata: "",
      showBank: false,
      bankData: "",
      showCalendar: false,
      calendarData: "",
      showCalculator: false,
    };
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

    return {
      content,
      showFlight: true,
      flightData: flightHtml,
      showMap: false,
      mapdata: "",
      showBank: false,
      bankData: "",
      showCalendar: false,
      calendarData: "",
      showCalculator: false,
      showHotel: false,
      hotelData: "",
    };
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

    return {
      content,
      showMap: true,
      mapdata: mapHtml,
      showBank: false,
      bankData: "",
      showCalendar: false,
      calendarData: "",
      showCalculator: false,
      showFlight: false,
      flightData: "",
      showHotel: false,
      hotelData: "",
    };
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

    return {
      content,
      showBank: true,
      bankData: bankHtml,
      showMap: false,
      mapdata: "",
      showCalendar: false,
      calendarData: "",
      showCalculator: false,
      showFlight: false,
      flightData: "",
      showHotel: false,
      hotelData: "",
    };
  }

  // 检查是否是日历响应
  const calendarMatch = response.match(/(.+)\.\_calendar\_(\d{4}-\d{2}-\d{2})/);
  if (calendarMatch) {
    const [_, content, date] = calendarMatch;
    const template = Locale.Store.Prompt.calendarHTML_template;
    return {
      content,
      showMap: false,
      mapdata: "",
      showCalendar: true,
      showCalculator: false,
      calendarData: template ? template.replace(/TARGET_DATE/g, date) : "",
      calculatorData: "",
      showFlight: false,
      flightData: "",
      showHotel: false,
      hotelData: "",
    };
  }

  // 检查是否是计算器响应
  const calculatorMatch = response.match(/(.+)\.\_calculator/);
  console.log("Calculator match:", calculatorMatch); // 添加调试日志

  if (calculatorMatch) {
    const [_, content] = calculatorMatch;
    return {
      content,
      showMap: false,
      mapdata: "",
      showCalendar: false,
      showCalculator: true,
      calendarData: "",
      calculatorData: "",
      showFlight: false,
      flightData: "",
      showHotel: false,
      hotelData: "",
    };
  }

  // 普通响应
  return {
    content: response,
    showMap: false,
    mapdata: "",
    showCalendar: false,
    showCalculator: false,
    calendarData: "",
    calculatorData: "",
    showFlight: false,
    flightData: "",
    showHotel: false,
    hotelData: "",
  };
}

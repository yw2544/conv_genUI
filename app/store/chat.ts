import { trimTopic, getMessageTextContent } from "../utils";
import log from "loglevel";
import Locale, { getLang } from "../locales";
import { showToast } from "../components/ui-lib";
import { ModelConfig, Model, useAppConfig, ConfigType } from "./config";
import { createEmptyTemplate, Template } from "./template";
import {
  DEFAULT_INPUT_TEMPLATE,
  DEFAULT_MODELS,
  DEFAULT_SYSTEM_TEMPLATE,
  StoreKey,
} from "../constant";
import {
  RequestMessage,
  MultimodalContent,
  LLMApi,
  processGPTResponse,
} from "../client/api";
import { estimateTokenLength } from "../utils/token";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";
import { ChatCompletionFinishReason, CompletionUsage } from "@mlc-ai/web-llm";
import { ChatImage } from "../typing";
import { OpenAI_Api } from "../client/openai";

export type ChatMessage = RequestMessage & {
  date: string;
  streaming?: boolean;
  isError?: boolean;
  id: string;
  showMap?: boolean;
  mapdata?: string;
  showCalendar?: boolean;
  calendarData?: string;
  showCalculator?: boolean;
  showBank?: boolean;
  bankData?: string;
  showFlight?: boolean;
  flightData?: string;
  showHotel?: boolean;
  hotelData?: string;
  showStock?: boolean;
  stockSymbol?: string;
  stockData?: string;
  stopReason?: ChatCompletionFinishReason;
  model?: Model;
  usage?: CompletionUsage;
  stockInterval?: string;
};

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    id: nanoid(),
    date: new Date().toLocaleString(),
    role: "user",
    content: "",
    stopReason: "stop",
    ...override,
  };
}

export interface ChatStat {
  tokenCount: number;
  wordCount: number;
  charCount: number;
}

export interface ChatSession {
  id: string;
  topic: string;

  memoryPrompt: string;
  messages: ChatMessage[];
  stat: ChatStat;
  lastUpdate: number;
  lastSummarizeIndex: number;
  clearContextIndex?: number;
  isGenerating: boolean;

  template: Template;
}

export const DEFAULT_TOPIC = Locale.Store.DefaultTopic;
export const BOT_HELLO: ChatMessage = createMessage({
  role: "assistant",
  content: Locale.Store.BotHello,
});

export const Function_system_prompt = createMessage({
  role: "system",
  content: Locale.Store.Prompt.Function_hint,
});

function createEmptySession(): ChatSession {
  return {
    id: nanoid(),
    topic: DEFAULT_TOPIC,
    memoryPrompt: "",
    messages: [],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,
    isGenerating: false,

    template: createEmptyTemplate(),
  };
}

function countMessages(msgs: ChatMessage[]) {
  return msgs.reduce(
    (pre, cur) => pre + estimateTokenLength(getMessageTextContent(cur)),
    0,
  );
}

function fillTemplateWith(input: string, modelConfig: ConfigType) {
  // Find the model in the DEFAULT_MODELS array that matches the modelConfig.model
  const modelInfo = DEFAULT_MODELS.find(
    (m) => m.name === modelConfig.modelConfig.model,
  );

  const vars = {
    provider: modelInfo?.provider || "unknown",
    model: modelConfig.modelConfig.model,
    time: new Date().toString(),
    lang: getLang(),
    input: input,
  };

  let output = modelConfig.template ?? DEFAULT_INPUT_TEMPLATE;

  // remove duplicate
  if (input.startsWith(output)) {
    output = "";
  }

  // must contains {{input}}
  const inputVar = "{{input}}";
  if (!output.includes(inputVar)) {
    output += "\n" + inputVar;
  }

  Object.entries(vars).forEach(([name, value]) => {
    const regex = new RegExp(`{{${name}}}`, "g");
    output = output.replace(regex, value.toString()); // Ensure value is a string
  });

  return output;
}

interface ChatStore {
  sessions: ChatSession[];
  currentSessionIndex: number;
  currentMessageId?: string;
}

const DEFAULT_CHAT_STATE = {
  sessions: [createEmptySession()],
  currentSessionIndex: 0,
};

export const useChatStore = createPersistStore(
  DEFAULT_CHAT_STATE,
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    const methods = {
      clearSessions() {
        set(() => ({
          sessions: [createEmptySession()],
          currentSessionIndex: 0,
        }));
      },

      selectSession(index: number) {
        set({
          currentSessionIndex: index,
        });
      },

      moveSession(from: number, to: number) {
        set((state) => {
          const { sessions, currentSessionIndex: oldIndex } = state;

          // move the session
          const newSessions = [...sessions];
          const session = newSessions[from];
          newSessions.splice(from, 1);
          newSessions.splice(to, 0, session);

          // modify current session id
          let newIndex = oldIndex === from ? to : oldIndex;
          if (oldIndex > from && oldIndex <= to) {
            newIndex -= 1;
          } else if (oldIndex < from && oldIndex >= to) {
            newIndex += 1;
          }

          return {
            currentSessionIndex: newIndex,
            sessions: newSessions,
          };
        });
      },

      newSession(template?: Template) {
        const session = createEmptySession();

        if (template) {
          session.template = {
            ...template,
          };
          session.topic = template.name;
        }

        set((state) => ({
          currentSessionIndex: 0,
          sessions: [session].concat(state.sessions),
        }));
      },

      nextSession(delta: number) {
        const n = get().sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = get().currentSessionIndex;
        get().selectSession(limit(i + delta));
      },

      deleteSession(index: number) {
        const deletingLastSession = get().sessions.length === 1;
        const deletedSession = get().sessions.at(index);

        if (!deletedSession) return;

        const sessions = get().sessions.slice();
        sessions.splice(index, 1);

        const currentIndex = get().currentSessionIndex;
        let nextIndex = Math.min(
          currentIndex - Number(index < currentIndex),
          sessions.length - 1,
        );

        if (deletingLastSession) {
          nextIndex = 0;
          sessions.push(createEmptySession());
        }

        // for undo delete action
        const restoreState = {
          currentSessionIndex: get().currentSessionIndex,
          sessions: get().sessions.slice(),
        };

        set(() => ({
          currentSessionIndex: nextIndex,
          sessions,
        }));

        showToast(
          Locale.Home.DeleteToast,
          {
            text: Locale.Home.Revert,
            onClick() {
              set(() => restoreState);
            },
          },
          5000,
        );
      },

      currentSession() {
        let index = get().currentSessionIndex;
        const sessions = get().sessions;

        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length - 1, Math.max(0, index));
          set(() => ({ currentSessionIndex: index }));
        }

        const session = sessions[index];

        return session;
      },

      resetGeneratingStatus() {
        set((state) => ({
          ...state,
          sessions: state.sessions.map((session) => ({
            ...session,
            isGenerating: false,
          })),
        }));
      },

      onNewMessage(message: ChatMessage, llm: LLMApi) {
        get().updateCurrentSession((session) => {
          session.messages = session.messages.concat();
          session.lastUpdate = Date.now();
        });
        get().updateStat(message);
        get().summarizeSession(llm);
      },

      onUserInput(content: string, llm: LLMApi) {
        const userMessage: ChatMessage = createMessage({
          role: "user",
          content:
            content +
            `

CRITICAL INSTRUCTION: You MUST follow these response format rules:

1. For BANK-related questions (balance, accounts, banking information):
Response format: "Yes, I'll help you check your bank accounts. Let me show you your account details._bank"

2. For CALCULATOR/MATH questions (any numbers or calculations):
Response format: Add "._calculator" at the end
Example: "What's 5+3?" -> xxxx(your own response)+"Let me calculate that for you: 5+3=8._calculator"

3. For CALENDAR/DATE questions (scheduling, dates, time):
Response format: Add "._calendar_YYYY-MM-DD" at the end
Example: "Show me March 1st" -> "Here's your calendar for March 1st._calendar_2024-03-01"

4. For any MAP/LOCATION relatedquestions:
Single location: "Let me show you [Location] on the map._map_[Location]"
Multiple locations: "Let me show you the route from [Location1] to [Location2]._map_[Location1]__[Location2]"
Note: Use full city names, normal in your own response (e.g., New York City, Los Angeles) and with underscores at the end (e.g., New_York_City, Los_Angeles)
Example1: "Where is New York?" -> xxxx(your own response)+"Let me show you New York City on the map._map_New_York_City"
Example2: "Show me the route from New York to Los Angeles" -> xxxx(your own response)+"Let me show you the route from New York City to Los Angeles._map_New_York_City__Los_Angeles"
Note that the first location is the starting point and the second location is the destination, so if from new york to los angeles, you should write New_York_City__Los_Angeles; if from los angeles to new york, you should write Los_Angeles__New_York_City

5. For FLIGHT-related questions (flight search, booking flights):
You first check if you can infer the departure date, departure airport, and the arrival airport from the user's question. If you can, include these data in the specified format. If you cannot, ask the user to specify departure date, departure airport, and the destination airport(three information need to be given at a time). 
Note that if the user includes departure city or arrival city, you just infer the airport at that area. For example, if the user want to depart from NYC, the departureairport should be JFK.AIRPORT, 
Example1: "I want to book a flight" -> xxxx(your own response)+"I'll help you search for available flights, can you specify your departure date, departure airport, and the destination airport? Or you can just tell me the departure city and the destination city. "
Example2: "I want to book a flight from New York to Los Angeles on March 1st" -> xxxx(your own response)+"Let me help you search for available flights from New York City to Los Angeles on March 1st._flight__JFK.AIRPORT__LAX.AIRPORT__2025-03-01"
Note that it is 2025-2-21 now, so the departure date should be later than 2025-02-18.

6. For HOTEL-related questions (hotel search, booking hotels):
You first check if you can infer the check-in date (arrival date), check-out date (departure date), and the city or region name from the user's question.
If you can, include these data in the specified format.
If you cannot, ask the user to specify all three pieces of information (check-in date, check-out date, and the destination city or region) at once.
Example1: "I want to book a hotel." -> xxxx(your own response)+"I'll help you search for available hotels, can you specify your check-in date, check-out date, and the destination city or region?
Example2: "Find me a hotel in NYC from April 20th to April 22nd." -> xxxx(your own response)+"I'll help you search for available hotels in New York City from April 20th to April 22nd._hotel__2025-04-20__2025-04-22__New_York_City"
Note that it is 2025-2-21 now, so the checkin/out date should be later than 2025-02-18. **the default year is 2025**

7. For STOCK-related questions (stock prices, market information):
Response format: Add "._stock_SYMBOL_INTERVAL" at the end
Note: Use official stock symbols (e.g., AAPL for Apple, MSFT for Microsoft)
For interval, choose from: 5m, 15m, 30m, 1h, 1d, 1wk, 1mo, 3mo based on the user's question (default is 1d); the interval means we get one datapoint per interval. So we need to change the interval depending on the user's question: now(15m),very recently(1h), past week/default(1d), past year(1mo).
Example1: "How is Apple stock doing?" -> xxxx(your own response)+"Let me check Apple's stock performance for you._stock_AAPL_1d"
Example2: "Show me Microsoft stock for the past week" -> xxxx(your own response)+"Here's Microsoft's stock performance over the past week._stock_MSFT_1d"

This is MANDATORY - you must use these EXACT formats for their respective types of questions. It the latest question is not related to these types of questions, you should not add any format.`,
        });

        const botMessage: ChatMessage = createMessage({
          role: "assistant",
          streaming: true,
          content: "",
        });

        get().updateCurrentSession((session) => {
          session.messages = session.messages.concat([userMessage, botMessage]);
          session.isGenerating = true;
        });

        llm.chat({
          messages: get().getMessagesWithMemory(),
          config: {
            ...useAppConfig.getState().modelConfig,
            stream: true,
            cache: useAppConfig.getState().cacheType,
          },
          onUpdate(message) {
            botMessage.streaming = true;
            if (message) {
              botMessage.content = message;
              get().updateCurrentSession((session) => {
                session.messages = session.messages.concat();
              });
            }
          },
          async onFinish(message, stopReason, usage) {
            botMessage.streaming = false;
            const processedResponse = await processGPTResponse(message);
            console.log("[DEBUG] message before Processed response:", message);
            console.log("[DEBUG] Processed response:", processedResponse);

            // 更新 botMessage 的内容为处理后的响应
            botMessage.content = processedResponse.content;
            botMessage.usage = usage;
            botMessage.stopReason = stopReason;

            // 添加其他功能的状态
            if (processedResponse.showBank) {
              botMessage.showBank = processedResponse.showBank;
              botMessage.bankData = processedResponse.bankData;
            }
            if (processedResponse.showCalendar) {
              botMessage.showCalendar = processedResponse.showCalendar;
              botMessage.calendarData = processedResponse.calendarData;
            }
            if (processedResponse.showFlight) {
              botMessage.showFlight = processedResponse.showFlight;
              botMessage.flightData = processedResponse.flightData;
            }

            // 处理股票功能
            if (processedResponse.showStock) {
              console.log(
                "[STOCK] Stock pattern detected:",
                processedResponse.stockSymbol,
                processedResponse.stockInterval,
              );
              botMessage.showStock = true;
              botMessage.stockSymbol = processedResponse.stockSymbol;
              botMessage.stockInterval = processedResponse.stockInterval;

              try {
                console.log(
                  "[STOCK] Fetching stock data from Yahoo Finance API...",
                );
                // 获取股票数据
                const stockResponse = await fetch(
                  `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/history?symbol=${processedResponse.stockSymbol}&interval=${processedResponse.stockInterval}&diffandsplits=false`,
                  {
                    headers: {
                      "x-rapidapi-host": "yahoo-finance15.p.rapidapi.com",
                      "x-rapidapi-key":
                        "73832acacdmsh912a5ba144580abp1e7c32jsn8690baeaba73",
                    },
                  },
                );

                const stockData = await stockResponse.json();
                console.log(
                  "[STOCK] Stock data received:",
                  stockData ? "Success" : "Failed",
                );

                // 处理股票数据，只保留meta和前30个items
                const processedStockData = {
                  meta: stockData.meta,
                  items: stockData.items ? stockData.items.slice(0, 30) : [],
                };
                console.log(
                  "[STOCK] Processed stock data:",
                  processedStockData.items.length,
                  "items",
                );

                // 准备第二次 OpenAI 调用的消息
                console.log("[STOCK] Preparing second OpenAI call...");
                const stockPrompt = `
You are a financial data visualization expert. I need you to create an HTML page with a stock price chart using Chart.js.

Here is the stock data for ${processedResponse.stockSymbol} with interval ${processedResponse.stockInterval}:
${JSON.stringify(processedStockData)}

Please create an HTML page with the following requirements:
1. Use the template below and fill in the appropriate data from the stock data provided
2. Extract dates and closing prices from the items array
3. Format the dates appropriately for display
4. Make sure the chart is responsive and visually appealing
5. Include the stock symbol and other relevant information in the title

Here is the template to use:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stock Price Chart</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #1a1a1a; /* 深色背景 */
        }
        .chart-container {
            width: 90%;
            max-width: 900px;
            background: #2a2a2a; /* 深色容器背景 */
            padding: 40px; /* 增加padding，避免图例与表格重叠 */
            border-radius: 10px;
            box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.2);
            text-align: center;
        }
        h2 {
            color: white;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="chart-container">
        <h2>Stock Price Trend 📈</h2>
        <canvas id="stockChart"></canvas>
    </div>

    <script>
        const ctx = document.getElementById('stockChart').getContext('2d');

        // 股票数据 (可替换为API数据)
        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const stockPrices = [150, 155, 160, 162, 158, 165, 170]; // 股票价格

        // 创建绿色渐变填充
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(0, 255, 127, 0.7)"); // 深绿
        gradient.addColorStop(1, "rgba(0, 255, 127, 0.2)"); // 透明绿色渐变

        const stockData = {
            labels: labels,
            datasets: [
                {
                    label: "Stock Price ($)",
                    data: stockPrices,
                    borderColor: "rgba(0, 255, 127, 1)",
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: "lime",
                    pointRadius: 6,
                    fill: true,
                    tension: 0.4
                }
            ]
        };

        new Chart(ctx, {
            type: "line",
            data: stockData,
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                },
                layout: {
                    padding: {
                        top: 50, // 增加上方间距
                        bottom: 20
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: Math.min(...stockPrices) - 5,
                        suggestedMax: Math.max(...stockPrices) + 5
                    }
                }
            }
        });
    </script>
</body>
</html>

Please replace the placeholder data with actual data from the provided stock information. Return ONLY the complete HTML code.`;

                // 打印完整的 prompt
                console.log("[STOCK] Second OpenAI prompt:", stockPrompt);

                // 创建新的消息数组用于第二次调用
                const messagesForStockHTML = [
                  {
                    role: "user" as const,
                    content: stockPrompt,
                  },
                ];

                // 第二次 OpenAI 调用
                console.log("[STOCK] Making second OpenAI call...");
                const openai = new OpenAI_Api();

                // 先调用 onNewMessage 和更新会话状态，然后异步处理股票数据
                get().onNewMessage(botMessage, llm);
                get().updateCurrentSession((session) => {
                  session.isGenerating = false;
                });

                // 异步处理股票数据
                openai.chat({
                  messages: messagesForStockHTML,
                  config: {
                    model: "gpt-4o",
                    temperature: 0.7,
                    cache: useAppConfig.getState().cacheType,
                  },
                  onFinish: (message) => {
                    console.log(
                      "[STOCK] Second OpenAI call completed with message length:",
                      message.length,
                    );
                    console.log(
                      "[STOCK] HTML content preview:",
                      message.substring(0, 200) + "...",
                    );

                    // 更新 botMessage 和会话
                    botMessage.stockData = message;
                    console.log("[STOCK] Updated botMessage with stock HTML");

                    get().updateCurrentSession((session) => {
                      session.messages = session.messages.map((m) =>
                        m.id === botMessage.id ? botMessage : m,
                      );
                    });
                    console.log("[STOCK] Session updated with stock HTML");
                  },
                  onError: (error) => {
                    console.error(
                      "[STOCK] Error in second OpenAI call:",
                      error,
                    );

                    // 设置错误 HTML
                    botMessage.stockData = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #1a1a1a;
            color: white;
            font-family: Arial, sans-serif;
        }
        .error-container {
            width: 90%;
            max-width: 600px;
            background: #2a2a2a;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.2);
            text-align: center;
        }
        h2 {
            color: #ff6b6b;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h2>Error Loading Stock Data</h2>
        <p>Sorry, we couldn't load the stock data for ${processedResponse.stockSymbol}. Please try again later.</p>
    </div>
</body>
</html>`;

                    // 更新会话
                    get().updateCurrentSession((session) => {
                      session.messages = session.messages.map((m) =>
                        m.id === botMessage.id ? botMessage : m,
                      );
                    });
                  },
                });

                // 提前返回，避免下面的代码再次调用 onNewMessage
                return;
              } catch (error) {
                console.error("[STOCK] Error processing stock data:", error);
                botMessage.stockData = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #1a1a1a;
            color: white;
            font-family: Arial, sans-serif;
        }
        .error-container {
            width: 90%;
            max-width: 600px;
            background: #2a2a2a;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.2);
            text-align: center;
        }
        h2 {
            color: #ff6b6b;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h2>Error Loading Stock Data</h2>
        <p>Sorry, we couldn't load the stock data for ${processedResponse.stockSymbol}. Please try again later.</p>
    </div>
</body>
</html>`;
              }
            }

            get().onNewMessage(botMessage, llm);
            get().updateCurrentSession((session) => {
              session.isGenerating = false;
            });
          },
          onError(error) {
            botMessage.content += "\n\n" + (error.message || error.toString());
            botMessage.streaming = false;
            botMessage.isError = true;
            get().updateCurrentSession((session) => {
              session.messages = session.messages.concat();
              session.isGenerating = false;
            });
          },
        });
      },

      getMemoryPrompt() {
        const session = get().currentSession();

        return {
          role: "system",
          content:
            session.memoryPrompt.length > 0
              ? Locale.Store.Prompt.History(session.memoryPrompt)
              : "",
          date: "",
        } as ChatMessage;
      },

      getMessagesWithMemory() {
        const session = get().currentSession();
        const messages = session.messages.slice();

        // 在发送给 LLM 的消息中添加计算器指令
        const messagesForLLM = messages.map((msg) => {
          if (msg.role === "user") {
            return {
              ...msg,
              content: msg.content,
            };
          }
          return msg;
        });

        const config = useAppConfig.getState();
        const modelConfig = config.modelConfig;
        const clearContextIndex = session.clearContextIndex ?? 0;
        const totalMessageCount = messages.length;

        // in-context prompts
        const contextPrompts = session.template.context.slice();

        // system prompts, to get close to OpenAI Web ChatGPT
        const shouldInjectSystemPrompts = config.enableInjectSystemPrompts;

        var systemPrompts: ChatMessage[] = [];
        systemPrompts = shouldInjectSystemPrompts
          ? [
              createMessage({
                role: "system",
                content: fillTemplateWith("", {
                  ...config,
                  template: DEFAULT_SYSTEM_TEMPLATE,
                }),
              }),
            ]
          : [];
        if (shouldInjectSystemPrompts) {
          log.debug(
            "[Global System Prompt] ",
            systemPrompts.at(0)?.content ?? "empty",
          );
        }

        // long term memory
        const shouldSendLongTermMemory =
          config.sendMemory &&
          session.memoryPrompt &&
          session.memoryPrompt.length > 0 &&
          session.lastSummarizeIndex > clearContextIndex;
        const longTermMemoryPrompts = shouldSendLongTermMemory
          ? [get().getMemoryPrompt()]
          : [];
        const longTermMemoryStartIndex = session.lastSummarizeIndex;

        // short term memory
        const shortTermMemoryStartIndex = Math.max(
          0,
          totalMessageCount - config.historyMessageCount,
        );

        // lets concat send messages, including 4 parts:
        // 0. system prompt: to get close to OpenAI Web ChatGPT
        // 1. long term memory: summarized memory messages
        // 2. pre-defined in-context prompts
        // 3. short term memory: latest n messages
        // 4. newest input message
        const memoryStartIndex = shouldSendLongTermMemory
          ? Math.min(longTermMemoryStartIndex, shortTermMemoryStartIndex)
          : shortTermMemoryStartIndex;
        // and if user has cleared history messages, we should exclude the memory too.
        const contextStartIndex = Math.max(clearContextIndex, memoryStartIndex);
        const maxTokenThreshold = modelConfig.max_tokens;

        // get recent messages as much as possible
        const reversedRecentMessages = [];
        for (
          let i = totalMessageCount - 1, tokenCount = 0;
          i >= contextStartIndex && tokenCount < maxTokenThreshold;
          i -= 1
        ) {
          const msg = messages[i];
          if (!msg || msg.isError) continue;
          tokenCount += estimateTokenLength(getMessageTextContent(msg));
          reversedRecentMessages.push(msg);
        }
        // concat all messages
        const recentMessages = [
          ...systemPrompts,
          ...longTermMemoryPrompts,
          ...contextPrompts,
          ...reversedRecentMessages.reverse(),
        ];

        return recentMessages;
      },

      updateMessage(
        sessionIndex: number,
        messageIndex: number,
        updater: (message?: ChatMessage) => void,
      ) {
        const sessions = get().sessions;
        const session = sessions.at(sessionIndex);
        const messages = session?.messages;
        updater(messages?.at(messageIndex));
        set(() => ({ sessions }));
      },

      resetSession() {
        get().updateCurrentSession((session) => {
          session.messages = [];
          session.memoryPrompt = "";
        });
      },

      summarizeSession(llm: LLMApi) {
        const config = useAppConfig.getState();
        const session = get().currentSession();
        const modelConfig = useAppConfig.getState().modelConfig;

        // remove error messages if any
        const messages = session.messages;

        // should summarize topic after chating more than 50 words
        const SUMMARIZE_MIN_LEN = 50;
        if (
          config.enableAutoGenerateTitle &&
          session.topic === DEFAULT_TOPIC &&
          countMessages(messages) >= SUMMARIZE_MIN_LEN
        ) {
          const topicMessages = messages.concat(
            createMessage({
              role: "user",
              content: Locale.Store.Prompt.Topic,
            }),
          );
          llm.chat({
            messages: topicMessages,
            config: {
              model: modelConfig.model,
              cache: useAppConfig.getState().cacheType,
              stream: false,
            },
            onFinish(message) {
              get().updateCurrentSession(
                (session) =>
                  (session.topic =
                    message.length > 0 ? trimTopic(message) : DEFAULT_TOPIC),
              );
            },
          });
        }
        const summarizeIndex = Math.max(
          session.lastSummarizeIndex,
          session.clearContextIndex ?? 0,
        );
        let toBeSummarizedMsgs = messages
          .filter((msg) => !msg.isError)
          .slice(summarizeIndex);

        const historyMsgLength = countMessages(toBeSummarizedMsgs);

        if (historyMsgLength > (modelConfig?.max_tokens ?? 4000)) {
          const n = toBeSummarizedMsgs.length;
          toBeSummarizedMsgs = toBeSummarizedMsgs.slice(
            Math.max(0, n - config.historyMessageCount),
          );
        }

        // add memory prompt
        toBeSummarizedMsgs.unshift(get().getMemoryPrompt());

        const lastSummarizeIndex = session.messages.length;

        log.debug(
          "[Chat History] ",
          toBeSummarizedMsgs,
          historyMsgLength,
          config.compressMessageLengthThreshold,
        );

        if (
          historyMsgLength > config.compressMessageLengthThreshold &&
          config.sendMemory
        ) {
          /** Destruct max_tokens while summarizing
           * this param is just shit
           **/
          const { max_tokens, ...modelcfg } = modelConfig;
          // The first message must be from system
          if (toBeSummarizedMsgs[0]?.role === "system") {
            // Merge system prompts
            toBeSummarizedMsgs[0].content =
              Locale.Store.Prompt.Summarize + toBeSummarizedMsgs[0].content;
          } else {
            toBeSummarizedMsgs = [
              createMessage({
                role: "system",
                content: Locale.Store.Prompt.Summarize,
                date: "",
              }),
              ...toBeSummarizedMsgs,
            ];
          }
          // The last message must be from user
          if (
            toBeSummarizedMsgs[toBeSummarizedMsgs.length - 1].role === "system"
          ) {
            toBeSummarizedMsgs = toBeSummarizedMsgs.concat([
              createMessage({
                role: "user",
                content: "",
                date: "",
              }),
            ]);
          }

          log.debug("summarizeSession", messages);
          llm.chat({
            messages: toBeSummarizedMsgs,
            config: {
              ...modelcfg,
              stream: true,
              model: modelConfig.model,
              cache: useAppConfig.getState().cacheType,
            },
            onUpdate(message) {
              session.memoryPrompt = message;
            },
            onFinish(message) {
              log.debug("[Memory] ", message);
              get().updateCurrentSession((session) => {
                session.lastSummarizeIndex = lastSummarizeIndex;
                session.memoryPrompt = message; // Update the memory prompt for stored it in local storage
              });
            },
            onError(err) {
              log.error("[Summarize] ", err);
            },
          });
        }
      },

      stopStreaming() {
        const sessions = get().sessions;
        sessions.forEach((session) => {
          if (session.messages.length === 0) {
            return;
          }
          const messages = [...session.messages];
          const lastMessage = messages[messages.length - 1];
          if (
            lastMessage.role === "assistant" &&
            lastMessage.streaming &&
            lastMessage.content.length === 0
          ) {
            // This message generation is interrupted by refresh and is stuck
            messages.splice(session.messages.length - 1, 1);
          }
          // Reset streaming status for all messages
          session.messages = messages.map((m) => ({
            ...m,
            streaming: false,
          }));
        });
        set(() => ({ sessions }));
      },

      updateStat(message: ChatMessage) {
        get().updateCurrentSession((session) => {
          session.stat.charCount += message.content.length;
          // TODO: should update chat count and word count
        });
      },

      updateCurrentSession(updater: (session: ChatSession) => void) {
        const sessions = get().sessions;
        const index = get().currentSessionIndex;
        updater(sessions[index]);
        set(() => ({ sessions }));
      },

      clearAllData() {
        localStorage.clear();
        location.reload();
      },
    };

    return methods;
  },
  {
    name: StoreKey.Chat,
    version: 0.1,
    migrate(persistedState, version): any {
      if (version < 0.1) {
        const store = persistedState as typeof DEFAULT_CHAT_STATE;
        store.sessions.forEach((s) => {
          s.messages.forEach((m) => {
            m.stopReason = "stop";
          });
        });
        return store;
      }
      return persistedState;
    },
  },
);

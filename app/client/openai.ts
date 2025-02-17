import { ChatOptions, fetchOpenAI } from "./api";
import { processGPTResponse } from "./api";

interface RequestMessage {
  showCalendar?: boolean;
  calendarData?: any; // 或者使用更具体的类型
  showCalculator?: boolean;
  showFlight?: boolean;
  flightData?: string;
}

export class OpenAI_Api {
  async chat(options: ChatOptions) {
    const { messages, config } = options;
    try {
      const data = await fetchOpenAI(messages, config);
      const reply =
        data.choices?.[0]?.message?.content || "No response received";

      const processedResponse = await processGPTResponse(reply);

      if (!options.if_agent) {
        if (config.stream) {
          options.onUpdate?.(
            processedResponse.content,
            data.choices[0].finish_reason,
          );
        }

        options.onFinish?.(
          processedResponse.content,
          data.choices[0].finish_reason,
          data.usage,
        );

        // 如果需要显示日历，在消息发送后更新消息属性
        const botMessage = messages[messages.length - 1];
        if (botMessage) {
          if (processedResponse.showMap) {
            (botMessage as any).showMap = true;
            (botMessage as any).mapdata = processedResponse.mapdata;
          }
          if (processedResponse.showBank) {
            (botMessage as any).showBank = true;
            (botMessage as any).bankData = processedResponse.bankData;
          }
          if (processedResponse.showCalculator) {
            (botMessage as any).showCalculator = true;
          }
          if (processedResponse.showCalendar) {
            (botMessage as any).showCalendar = true;
            (botMessage as any).calendarData = processedResponse.calendarData;
          }
          if (processedResponse.showFlight) {
            (botMessage as any).showFlight = true;
            (botMessage as any).flightData = processedResponse.flightData;
          }
        }
      }
      options.if_agent && options.onAgent?.(reply);
    } catch (error: any) {
      console.error("OpenAI Error:", error);
      options.onError?.(error);
    }
  }

  async abort() {
    console.warn("OpenAI does not support request abortion.");
  }

  async models() {
    return [
      { name: "gpt-3.5-turbo", display_name: "GPT-3.5 Turbo" },
      { name: "gpt-4", display_name: "GPT-4" },
      { name: "gpt-4o", display_name: "GPT-4o" },
    ];
  }
}

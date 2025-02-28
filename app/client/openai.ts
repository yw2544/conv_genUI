import { ChatOptions, fetchOpenAI } from "./api";
import { processGPTResponse } from "./api";

interface RequestMessage {
  showCalendar?: boolean;
  calendarData?: any;
  showCalculator?: boolean;
  showFlight?: boolean;
  flightData?: string;
  showWeather?: boolean;
  weatherData?: string;
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
          if (processedResponse.showHotel) {
            (botMessage as any).showHotel = true;
            (botMessage as any).hotelData = processedResponse.hotelData;
          }
          if (processedResponse.showStock) {
            (botMessage as any).showStock = true;
            (botMessage as any).stockData = processedResponse.stockData;
          }
          if (processedResponse.showWeather) {
            (botMessage as any).showWeather = true;
            (botMessage as any).weatherData = processedResponse.weatherData;
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

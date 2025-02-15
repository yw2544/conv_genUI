import { ChatOptions, fetchOpenAI } from "./api";

export class OpenAI_Api {
  async chat(options: ChatOptions) {
    const { messages, config } = options;
    try {
      const data = await fetchOpenAI(messages, config);
      const reply =
        data.choices?.[0]?.message?.content || "No response received";
      console.log("API Response:", reply);
      !options.if_agent &&
        options.onFinish?.(reply, data.choices[0].finish_reason, data.usage);
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

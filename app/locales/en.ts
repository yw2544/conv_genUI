import { SubmitKey } from "../store/config";

// if you are adding a new translation, please use PartialLocaleType instead of LocaleType

const en = {
  Title: "WebLLM Chat",
  Subtitle: "AI Models Running in Browser",
  WIP: "Coming Soon...",
  ChatItem: {
    ChatItemCount: (count: number) => `${count} messages`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} messages`,
    EditMessage: {
      Title: "Edit All Messages",
      Topic: {
        Title: "Topic",
        SubTitle: "Change the current topic",
      },
    },
    Actions: {
      ChatList: "Go To Chat List",
      CompressedHistory: "Compressed History Memory Prompt",
      Export: "Export All Messages as Markdown",
      Copy: "Copy",
      Stop: "Stop",
      Share: "Share",
      Retry: "Retry",
      Delete: "Delete",
      Edit: "Edit",
      EditConversation: "Edit Conversation",
    },
    Commands: {
      new: "Start a new chat",
      newt: "Start a new chat with template",
      next: "Next Chat",
      prev: "Previous Chat",
      clear: "Clear Context",
      del: "Delete Chat",
    },
    Roles: {
      System: "System Prompt",
      Assistant: "Assistant",
      User: "User",
    },
    InputActions: {
      Stop: "Stop",
      ToBottom: "To Latest",
      Theme: {
        auto: "Auto",
        light: "Light Theme",
        dark: "Dark Theme",
      },
      QuickPrompt: "Quick Prompts",
      Clear: "Clear Context",
      Settings: "Settings",
      UploadImage: "Upload Images",
    },
    Rename: "Rename Chat",
    Typing: "Typing…",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} to send`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter to wrap";
      }
      return inputHints + ", / to search prompts, : to use commands";
    },
    Send: "Send",
    Config: {
      Reset: "Reset to Default",
      SaveAs: "Save Prompts",
      Confirm: "Confirm",
    },
    IsContext: "System Prompt",
  },
  Export: {
    Title: "Export Messages",
    Copy: "Copy All",
    Download: "Download",
    MessageFromYou: "Message From You",
    MessageFromWebLLM: "Message From WebLLM",
    Share: "Share",
    Format: {
      Title: "Export Format",
      SubTitle: "Markdown or PNG Image",
    },
    IncludeContext: {
      Title: "Including Context",
      SubTitle: "Export context prompts in template or not",
    },
    Steps: {
      Select: "Select",
      Preview: "Preview",
    },
    Image: {
      Toast: "Capturing Image...",
      Modal: "Long press or right click to save image",
    },
  },
  Select: {
    Search: "Search",
    All: "Select All",
    Latest: "Select Latest",
    Clear: "Clear",
  },
  Memory: {
    Title: "Memory Prompt",
    EmptyContent: "Nothing yet.",
    Send: "Send Memory",
    Copy: "Copy Memory",
    Reset: "Reset Session",
    ResetConfirm:
      "Resetting will clear the current conversation history and historical memory. Are you sure you want to reset?",
  },
  Home: {
    NewChat: "New Chat",
    DeleteChat: "Confirm to delete the selected conversation?",
    DeleteToast: "Chat Deleted",
    Revert: "Revert",
  },
  Settings: {
    Title: "Settings",
    SubTitle: "All Settings",
    Danger: {
      Reset: {
        Title: "Reset All Settings",
        SubTitle: "Reset all setting items to default",
        Action: "Reset",
        Confirm: "Confirm to reset all settings to default?",
      },
      Clear: {
        Title: "Clear All Data",
        SubTitle: "Clear all messages and settings",
        Action: "Clear",
        Confirm: "Confirm to clear all messages and settings?",
      },
    },
    Lang: {
      Name: "Language", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      All: "All Languages",
    },
    Avatar: "Avatar",
    FontSize: {
      Title: "Font Size",
      SubTitle: "Adjust font size of chat content",
    },
    InjectSystemPrompts: {
      Title: "Inject System Prompts",
      SubTitle: "Inject a global system prompt for every request",
    },
    InputTemplate: {
      Title: "Input Template",
      SubTitle: "Newest message will be filled to this template",
    },

    Update: {
      Version: (x: string) => `Version: ${x}`,
      IsLatest: "Latest version",
      CheckUpdate: "Check Update",
      IsChecking: "Checking update...",
      FoundUpdate: (x: string) => `Found new version: ${x}`,
      GoToUpdate: "Update",
    },
    SendKey: "Send Key",
    Theme: "Theme",
    TightBorder: "Tight Border",
    SendPreviewBubble: {
      Title: "Send Preview Bubble",
      SubTitle: "Preview markdown in bubble",
    },
    AutoGenerateTitle: {
      Title: "Auto Generate Title",
      SubTitle: "Generate a suitable title based on the conversation content",
    },
    Template: {
      Builtin: {
        Title: "Hide Builtin Templates",
        SubTitle: "Hide builtin templates in template list",
      },
    },
    Prompt: {
      Disable: {
        Title: "Disable auto-completion",
        SubTitle: "Input / to trigger auto-completion",
      },
      List: "Prompt List",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} built-in, ${custom} user-defined`,
      Edit: "Edit",
      Modal: {
        Title: "Prompt List",
        Add: "Add One",
        Search: "Search Prompts",
      },
      EditModal: {
        Title: "Edit Conversation",
      },
      Calendar: {
        system: `When users ask date-related questions (including but not limited to:
- Asking about specific dates
- Asking about days of the week
- Asking about holidays
- Asking about nth weekday of a month/year
- Asking about date relationships
etc.), you need to:
1. Provide accurate answers
2. Add a date marker at the end of your response in the format "._calendar_YYYY-MM-DD"

Examples:
User: "What's the first Monday of 2025?"
Assistant: "The first Monday of 2025 is January 6th._calendar_2025-01-06"

User: "When is Christmas?"
Assistant: "Christmas is on December 25th._calendar_2023-12-25"

User: "When is the next Mid-Autumn Festival?"
Assistant: "The next Mid-Autumn Festival falls on September 17th, 2024._calendar_2024-09-17"`,
      },
      Function_hint: `CRITICAL SYSTEM INSTRUCTION:

For ANY response involving numbers, math, or calculations:
You can respond naturally, but you MUST append "._calculator" at the end of EVERY response.

Examples:
User: "What's 1+1?"
Assistant: "1 plus 1 equals 2! Let me show you how to calculate this._calculator"

User: "Can you multiply 5 by 3?"
Assistant: "Sure! 5 multiplied by 3 is 15. I can help you verify this calculation._calculator"

User: "What's 25% of 100?"
Assistant: "25% of 100 is 25. Would you like me to break down this percentage calculation?._calculator"

User: "Solve 2x + 5 = 15"
Assistant: "Let's solve this equation step by step! First, subtract 5 from both sides..._calculator"

CRITICAL RULES:
1. ANY response about numbers/math MUST end with "._calculator"
2. You can explain, use emojis, be friendly - just add "._calculator" at the end
3. This is MANDATORY - never forget the "._calculator" suffix
4. If the question involves ANY numbers or calculations, the response MUST have "._calculator"

For non-math questions, respond normally without the suffix.`,
    },
    HistoryCount: {
      Title: "Attached Messages Count",
      SubTitle: "Number of sent messages attached per request",
    },
    CompressThreshold: {
      Title: "History Compression Threshold",
      SubTitle:
        "Will compress if uncompressed messages length exceeds the value",
    },

    Usage: {
      Title: "Account Balance",
      SubTitle(used: any, total: any) {
        return `Used this month $${used}, subscription $${total}`;
      },
      IsChecking: "Checking...",
      Check: "Check",
      NoAccess: "Enter API Key to check balance",
    },
    Model: "Model",
    ModelClientType: {
      Title: "Model Type",
      WebLlm: "WebLLM Models",
      MlcLlm: "MLC-LLM REST API (Advanced)",
    },

    MlcLlmApi: {
      Title: "API Endpoint",
      SubTitle: "Endpoint URL created by MLC-LLM serve command",
      Connect: {
        Title: "Connect",
        SubTitle: "Connect to the API",
      },
    },
    ContextWindowLength: {
      Title: "Context Window Length",
      SubTitle: "The maximum number of tokens for the context window",
    },
    Temperature: {
      Title: "Temperature",
      SubTitle: "A larger value makes the more random output",
    },
    TopP: {
      Title: "Top P",
      SubTitle: "Do not alter this value together with temperature",
    },
    MaxTokens: {
      Title: "Max Tokens",
      SubTitle: "Maximum length of input tokens and generated tokens",
    },
    PresencePenalty: {
      Title: "Presence Penalty",
      SubTitle:
        "A larger value increases the likelihood to talk about new topics",
    },
    FrequencyPenalty: {
      Title: "Frequency Penalty",
      SubTitle:
        "A larger value decreasing the likelihood to repeat the same line",
    },
    CacheType: {
      Title: "Cache Type",
      SubTitle: "Use IndexDB or Cache API to store model weights",
    },
    LogLevel: {
      Title: "Logging Level",
      SubTitle: "Adjust how much detail should be printed to console",
    },
  },
  Store: {
    DefaultTopic: "New Conversation",
    BotHello: "Hello! How can I help you today?",
    Error: "Something went wrong, please try again later.",
    Prompt: {
      History: (content: string) =>
        "This is a summary of the chat history as a recap: " + content,
      Topic:
        "Please generate a four to five word title summarizing our conversation without any lead-in, punctuation, quotation marks, periods, symbols, bold text, or additional text. Remove enclosing quotation marks.",
      Summarize:
        "Summarize the discussion briefly in 200 words or less to use as a prompt for future context.",
      Function_hint: `CRITICAL SYSTEM INSTRUCTION:

For ANY response involving numbers, math, or calculations:
You can respond naturally, but you MUST append "._calculator" at the end of EVERY response.

Examples:
User: "What's 1+1?"
Assistant: "1 plus 1 equals 2! Let me show you how to calculate this._calculator"

User: "Can you multiply 5 by 3?"
Assistant: "Sure! 5 multiplied by 3 is 15. I can help you verify this calculation._calculator"

User: "What's 25% of 100?"
Assistant: "25% of 100 is 25. Would you like me to break down this percentage calculation?._calculator"

User: "Solve 2x + 5 = 15"
Assistant: "Let's solve this equation step by step! First, subtract 5 from both sides..._calculator"

CRITICAL RULES:
1. ANY response about numbers/math MUST end with "._calculator"
2. You can explain, use emojis, be friendly - just add "._calculator" at the end
3. This is MANDATORY - never forget the "._calculator" suffix
4. If the question involves ANY numbers or calculations, the response MUST have "._calculator"

For non-math questions, respond normally without the suffix.`,
      Function_agent:
        "You are a professional code generation assistant, specializing in generating HTML code that uses Leaflet and Leaflet Routing Machine to render map operations such as positioning and route drawing. Below is a code example. You will directly return the complete and usable HTML code as a string and no need other response, modifying only the scripts section to meet different user requirements.\n",
      mapHTML_template: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="utf-8">
          <title>Route Map</title>
          <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
      </head>
      <body>
          <div id="map" style="width: 100%; height: 100vh;"></div>
          <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
          <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
          <script>
              document.addEventListener("DOMContentLoaded", function() {
                  var map = L.map("map").setView([35.8617, 104.1954], 5); // 设置中国视角
      
                  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                      attribution: "© OpenStreetMap contributors"
                  }).addTo(map);
      
                  // 使用 Leaflet Routing Machine 画路线
                  L.Routing.control({
                      waypoints: [
                          L.latLng(39.9042, 116.4074), // 北京
                          L.latLng(31.2304, 121.4737)  // 上海
                      ],
                      routeWhileDragging: true
                  }).addTo(map);
              });
          </script>
      </body>
      </html>`,
      calendarHTML_template: `<!DOCTYPE html>
<html>
<head>
    <style>
        .calendar {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 20px auto;
        }
        .header {
            text-align: center;
            padding: 10px;
            background: #f0f0f0;
            font-size: 18px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: #ddd;
        }
        .cell {
            background: white;
            padding: 10px;
            text-align: center;
        }
        .weekday {
            background: #f0f0f0;
            font-weight: bold;
        }
        .highlight {
            background: #ffeb3b;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="calendar">
        <div class="header" id="monthYear"></div>
        <div class="grid">
            <div class="cell weekday">Sun</div>
            <div class="cell weekday">Mon</div>
            <div class="cell weekday">Tue</div>
            <div class="cell weekday">Wed</div>
            <div class="cell weekday">Thu</div>
            <div class="cell weekday">Fri</div>
            <div class="cell weekday">Sat</div>
        </div>
        <div class="grid" id="dates"></div>
    </div>
    <script>
        const date = new Date('TARGET_DATE');
        const year = date.getFullYear();
        const month = date.getMonth();
        const targetDay = date.getDate();

        document.getElementById('monthYear').textContent = 
            new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid = document.getElementById('dates');

        for (let i = 0; i < 42; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            const dayOfMonth = i - firstDay + 1;
            
            if (dayOfMonth > 0 && dayOfMonth <= daysInMonth) {
                cell.textContent = dayOfMonth;
                if (dayOfMonth === targetDay) {
                    cell.className = 'cell highlight';
                }
            }
            grid.appendChild(cell);
        }
    </script>
</body>
</html>`,
      calculatorHTML_template: `<iframe src="https://www.calculator.net/scientific-calculator.html"
        width="380" height="600" 
        style="border: none;"
        sandbox="allow-same-origin allow-scripts allow-popups">
      </iframe>`,
    },
  },
  Copy: {
    Success: "Copied to clipboard",
    Failed: "Copy failed, please grant permission to access clipboard",
  },
  Download: {
    Success: "Content downloaded to your directory.",
    Failed: "Download failed.",
  },
  Context: {
    Toast: (x: any) => `With ${x} system prompts`,
    Edit: "Conversation Settings",
    Add: "Add a Prompt",
    Clear: "Context Cleared",
    Revert: "Revert",
  },
  Plugin: {
    Name: "Plugin",
  },
  FineTuned: {
    Sysmessage: "You are an assistant that",
  },
  Template: {
    Name: "Prompts",
    Page: {
      Title: "Prompt Library",
      SubTitle: "Saved Prompt Collection",
      Search: "Search Prompts",
      Create: "Create",
    },
    Item: {
      Info: (count: number) => `${count} prompts`,
      Chat: "Chat",
      View: "View",
      Edit: "Edit",
      Delete: "Delete",
      DeleteConfirm: "Confirm to delete?",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `${readonly ? "View" : "Edit"} Prompt Template ${
          readonly ? "(readonly)" : ""
        }`,
      Save: "Save",
      Download: "Download",
      Clone: "Clone",
    },
    Config: {
      Avatar: "Bot Avatar",
      Name: "Prompts Name",
      HideContext: {
        Title: "Hide Context Prompts",
        SubTitle: "Do not show in-context prompts in chat",
      },
      Share: {
        Title: "Share This Template",
        SubTitle: "Generate a link to this template",
        Action: "Copy Link",
      },
    },
  },
  NewChat: {
    Return: "Return",
    Skip: "Just Start",
    Title: "Pick a Template",
    SubTitle: "Start chat with a template",
    More: "Find More",
    NotShow: "Never Show Again",
    ConfirmNoShow: "Confirm to disable? You can enable it in settings later.",
  },
  ModelSelect: {
    Title: "Model Selection",
    SearchPlaceholder: "Search model...",
  },
  UI: {
    Confirm: "Confirm",
    Cancel: "Cancel",
    Close: "Close",
    Create: "Create",
    Edit: "Edit",
    Export: "Export",
    Import: "Import",
    Sync: "Sync",
    Config: "Config",
  },
  Exporter: {
    Description: {
      Title: "Only messages after clearing the context will be displayed",
    },
    Model: "Model",
    Messages: "Messages",
    Topic: "Topic",
    Time: "Time",
  },

  URLCommand: {
    Code: "Detected access code from url, confirm to apply? ",
    Settings: "Detected settings from url, confirm to apply?",
  },

  ServiceWorker: {
    Error:
      "The WebLLM worker has lost connection. Please close all tabs of WebLLM Chat and try opening WebLLM Chat again.",
  },
  MlcLLMConnect: {
    Title: "Connect to MLC-LLM API Endpoint",
  },
};

export default en;

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type LocaleType = typeof en;
export type PartialLocaleType = DeepPartial<typeof en>;

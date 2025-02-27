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
      Function_hint: `I can help you with various tasks. Just ask me about:

1. Math & Calculations
   Example: "What's 25% of 80?"
   I'll respond: "25% of 80 is 20._calculator"

2. Dates & Calendar
   Example: "When is Christmas 2025?"
   I'll respond: "Christmas 2025 falls on Thursday, December 25th._calendar_2025-12-25"

3. Bank Account Information
   Example: "Show my account balance"
   I'll respond: "Here are your bank account details._bank"

4. Location & Navigation
   Example: "How do I get from Beijing to Shanghai?"
   I'll respond: "Let me show you the route on a map._map"

Just ask your question naturally, and I'll provide the appropriate visualization!`,
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
      Function_hint: `I can help you with various tasks. Just ask me about:

1. Math & Calculations
   Example: "What's 25% of 80?"
   I'll respond: "25% of 80 is 20._calculator"

2. Dates & Calendar
   Example: "When is Christmas 2025?"
   I'll respond: "Christmas 2025 falls on Thursday, December 25th._calendar_2025-12-25"

3. Bank Account Information
   Example: "Show my account balance"
   I'll respond: "Here are your bank account details._bank"

4. Location & Navigation
   Example: "How do I get from Beijing to Shanghai?"
   I'll respond: "Let me show you the route on a map._map"

Just ask your question naturally, and I'll provide the appropriate visualization!`,
      mapHTML_template: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Route Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
    <style>
        .leaflet-routing-container {
            position: fixed !important;
            top: 10px !important;
            left: 10px !important;
            width: 200px !important;
            max-height: 120px !important;
            overflow-y: auto;
            background-color: white;
            padding: 6px;
            border-radius: 4px;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            font-size: 11px;
            z-index: 1000;
        }
        .leaflet-routing-alt {
            max-height: 100px !important;
            overflow-y: auto;
        }
    </style>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
</head>
<body>
    <div id="map" style="width: 100%; height: 100vh;"></div>

    <script>
        var locations = LOCATIONS_ARRAY;

        var map = L.map("map").setView([37.0902, -95.7129], 4);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors"
        }).addTo(map);

        function getCoordinates(locationName) {
            return fetch(\`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&accept-language=en&q=\${locationName}\`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        return {
                            lat: parseFloat(data[0].lat),
                            lon: parseFloat(data[0].lon),
                            displayName: data[0].display_name
                        };
                    } else {
                        throw new Error(\`Location "\${locationName}" not found\`);
                    }
                });
        }

        async function loadMap() {
            if (locations.length === 0) {
                alert("No locations provided.");
                return;
            }

            try {
                let waypoints = [];
                let markers = [];

                for (let loc of locations) {
                    let place = await getCoordinates(loc);
                    waypoints.push(L.latLng(place.lat, place.lon));
                    let marker = L.marker([place.lat, place.lon]).addTo(map)
                        .bindPopup(place.displayName);
                    markers.push(marker);
                }

                if (waypoints.length === 1) {
                    map.setView(waypoints[0], 10);
                    markers[0].openPopup();
                } else {
                    L.Routing.control({
                        waypoints: waypoints,
                        routeWhileDragging: true,
                        lineOptions: {
                            styles: [{color: '#2196F3', weight: 4}]
                        },
                        createMarker: function() { return null; },
                        addWaypoints: false,
                        draggableWaypoints: false,
                        fitSelectedRoutes: true,
                        showAlternatives: false
                    }).addTo(map);

                    var bounds = L.latLngBounds(waypoints);
                    map.fitBounds(bounds);
                }
            } catch (error) {
                alert("Error: " + error.message);
            }
        }

        loadMap();
    </script>
</body>
</html>`,
      calendarHTML_template: `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 10px;
            box-sizing: border-box;
        }
        .calendar {
            font-family: Arial, sans-serif;
            width: 300px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            padding: 10px;
            background: #f0f0f0;
            font-size: 16px;
            border-radius: 8px 8px 0 0;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: #ddd;
            padding: 1px;
        }
        .cell {
            background: white;
            padding: 8px 4px;
            text-align: center;
            font-size: 14px;
        }
        .weekday {
            background: #f0f0f0;
            font-weight: bold;
        }
        .highlight {
            background: #2196F3;
            color: white;
            font-weight: bold;
        }
        .empty {
            background: #f9f9f9;
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
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
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
            const dayOfMonth = i - firstDay + 1;
            
            if (dayOfMonth > 0 && dayOfMonth <= daysInMonth) {
                cell.className = 'cell';
                cell.textContent = dayOfMonth;
                if (dayOfMonth === targetDay) {
                    cell.className = 'cell highlight';
                }
            } else {
                cell.className = 'cell empty';
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
      bankHTML_template: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bank Accounts</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f7f7f7; }
                table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #222; color: white; }
                td strong { color: #333; }
            </style>
        </head>
        <body>
            <h2>Bank Account Summary</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Account</th>
                        <th>Product</th>
                        <th>Last Date</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    BANK_DATA_ROWS
                </tbody>
            </table>
        </body>
        </html>`,
      flightHTML_template: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flight Search</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 0px;
            background: #f8fafc;
            color: #1a1f36;
        }
        .flight { 
            border: 1px solid rgba(65, 84, 255, 0.05);
            padding: 8px;
            margin-bottom: 8px;
            border-radius: 10px;
            background: white;
            box-shadow: 0 2px 12px rgba(0,0,0,0.03);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .flight:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .flight-info {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            align-items: left;
            justify-items: left;
            gap: 15px;
        }
        .airline-name {
            font-weight: 600;
            color: #000000;
            grid-column: 1 / -1;
        }
        .time-section {
            display: flex;
            align-items: center;
            gap: 10px;
            grid-column: 1 / 4;
        }
        .time {
            font-size: 15px;
            font-weight: 500;
        }
        .city {
            color: #697386;
            font-size: 13px;
        }
        .price {
            text-align: right;
            font-weight: 500;
            color: #4CAF50;
            grid-column: 4;
        }
        .seats {
            color: #697386;
            font-size: 13px;
            grid-column: 1 / -1;
        }
        .debug-info {
            margin-bottom: 24px;
            padding: 8px;
            background: rgba(65, 84, 255, 0.03);
            border-radius: 12px;
            font-size: 14px;
            color: #697386;
        }
        .summary {
            margin-bottom: 8px;
            color: #697386;
            font-size: 14px;
            padding: 10px;
        }
        h2 {
            color: #1a1f36;
            font-size: 12px;
            margin-bottom: 6px;
        }
        .loading {
            text-align: center;
            padding: 20px;
            color: #697386;
            font-size: 15px;
        }
    </style>
</head>
<body>
    <h2>Flight Search Results</h2>
    <div id="flights" class="loading">Searching for the best flights...</div>
    
    <script>
        const API_KEY = "73832acacdmsh912a5ba144580abp1e7c32jsn8690baeaba73";
        
        // 添加缓存键
        const CACHE_KEY = 'flightSearchResults_DEPARTURE_AIRPORT_ARRIVAL_AIRPORT_DEPARTURE_DATE';
        
        async function fetchFlights() {
            // 检查缓存
            const cachedData = sessionStorage.getItem(CACHE_KEY);
            if (cachedData) {
                renderFlights(JSON.parse(cachedData));
                return;
            }

            try {
                const response = await fetch(\`https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights?fromId=DEPARTURE_AIRPORT&toId=ARRIVAL_AIRPORT&departDate=DEPARTURE_DATE&pageNo=1&adults=1&children=0%2C17&sort=BEST&cabinClass=ECONOMY&currency_code=USD\`, {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-host': 'booking-com15.p.rapidapi.com',
                        'x-rapidapi-key': API_KEY
                    }
                });
                
                const data = await response.json();
                
                // 存储到 sessionStorage
                if (data.data?.flightOffers) {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data.data.flightOffers));
                }
                
                renderFlights(data.data?.flightOffers || []);
            } catch (error) {
                document.getElementById("flights").innerHTML = "Unable to load flights at this time. Please try again later.<br>Error: " + error.message;
            }
        }

        function renderFlights(flightOffers) {
            const flightsDiv = document.getElementById("flights");
            flightsDiv.innerHTML = '';
            
            if (!flightOffers || flightOffers.length === 0) {
                flightsDiv.innerHTML = "No flights found matching your criteria.";
                return;
            }
            
            const summaryDiv = document.createElement("div");
            summaryDiv.className = "summary";
            summaryDiv.innerHTML = \`We have \${flightOffers.length} flights in total, displaying \${Math.min(10, flightOffers.length)} results\`;
            flightsDiv.appendChild(summaryDiv);
            
            flightOffers.slice(0, 10).forEach((offer, index) => {
                try {
                    const flightDiv = document.createElement("div");
                    flightDiv.className = "flight";
                    
                    if (!offer.segments || !offer.segments[0] || !offer.segments[0].legs || !offer.segments[0].legs[0]) {
                        console.warn(\`Flight index \${index} data incomplete: \`, offer);
                        return;
                    }

                    const segment = offer.segments[0];
                    const leg = segment.legs[0];
                    const carrier = leg.carriersData?.[0] || { 
                        name: 'Unknown Airline',
                        logo: 'default-airline-logo.png'
                    };
                    
                    const price = offer.priceBreakdown?.total;
                    const formattedPrice = price ? 
                        \`\${price.currencyCode} \${price.units}.\${Math.round(price.nanos / 1e7)}\` : 
                        'N/A';
                    
                    const seatsAvailable = offer.seatAvailability?.numberOfSeatsAvailable || "Unknown";
                    
                    flightDiv.innerHTML = \`
                        <div class="flight-info">
                            <div class="airline-name">
                                <img src="\${carrier.logo}" 
                                     alt="\${carrier.name}" 
                                     onerror="this.src='default-airline-logo.png'" 
                                     style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;">
                                <span>\${carrier.name}</span>
                            </div>
                            <div class="time-section">
                                <div>
                                    <div class="time">\${leg.departureTime || 'N/A'}</div>
                                    <div class="city">\${segment.departureAirport?.cityName || 'N/A'}</div>
                                </div>
                                <span>✈️</span>
                                <div>
                                    <div class="time">\${leg.arrivalTime || 'N/A'}</div>
                                    <div class="city">\${segment.arrivalAirport?.cityName || 'N/A'}</div>
                                </div>
                            </div>
                            <div class="price">\${formattedPrice}</div>
                            <div class="seats">Available Seats: \${seatsAvailable}</div>
                        </div>
                    \`;
                    
                    flightsDiv.appendChild(flightDiv);
                } catch (error) {
                    console.error(\`Error displaying flight (index \${index}): \`, error);
                }
            });
        }

        // 只在页面首次加载时执行一次
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fetchFlights);
        } else {
            fetchFlights();
        }
    </script>
</body>
</html>`,
      hotelHTML_template: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hotel Search</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: #f8fafc;
            color: #1a1f36;
        }
        .search-details {
            background: #f1f5f9;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .hotel-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .hotel-card {
            border: 1px solid rgba(65, 84, 255, 0.1);
            padding: 16px;
            border-radius: 10px;
            background: white;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
            display: flex;
            gap: 12px;
        }
        .hotel-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .hotel-image {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 8px;
        }
        .hotel-info {
            flex-grow: 1;
        }
        .hotel-name {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
        }
        .hotel-price {
            font-size: 16px;
            font-weight: 500;
            color: #10b981;
            margin-top: 8px;
        }
        .hotel-review {
            font-size: 14px;
            color: #f59e0b;
            margin-top: 4px;
        }
    </style>
</head>
<body>
    <div class="search-details">
        <h3>Search Details</h3>
        <p>Location: <span id="location">LOCATION</span></p>
        <p>Check-in: <span id="checkin">CHECK_IN_DATE</span></p>
        <p>Check-out: <span id="checkout">CHECK_OUT_DATE</span></p>
    </div>
    
    <h2>Available Hotels</h2>
    <div id="hotels" class="hotel-list">Searching for hotels...</div>

    <script>
        const API_KEY = "73832acacdmsh912a5ba144580abp1e7c32jsn8690baeaba73";
        
      
        const CACHE_KEY = 'hotelSearchResults_LOCATION_CHECK_IN_DATE_CHECK_OUT_DATE';
        
        async function fetchHotels() {
            
            const cachedData = sessionStorage.getItem(CACHE_KEY);
            if (cachedData) {
                renderHotels(JSON.parse(cachedData));
                return;
            }

            try {
                const destResponse = await fetch(\`https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=LOCATION\`, {
                    method: "GET",
                    headers: {
                        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
                        "x-rapidapi-key": API_KEY
                    }
                });
                const destData = await destResponse.json();
                if (!destData.data || destData.data.length === 0) {
                    document.getElementById("hotels").innerHTML = "No destinations found.";
                    return;
                }

                const dest_id = destData.data[0].dest_id;
                const dest_type = destData.data[0].dest_type;

                const hotelResponse = await fetch(\`https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?dest_id=\${dest_id}&search_type=\${dest_type}&arrival_date=CHECK_IN_DATE&departure_date=CHECK_OUT_DATE&adults=1&children_age=0%2C17&room_qty=1&page_number=1&units=metric&temperature_unit=c&languagecode=en-us&currency_code=USD\`, {
                    method: "GET",
                    headers: {
                        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
                        "x-rapidapi-key": API_KEY
                    }
                });

                const hotelData = await hotelResponse.json();
                if (!hotelData.data || !hotelData.data.hotels || hotelData.data.hotels.length === 0) {
                    document.getElementById("hotels").innerHTML = "No hotels found.";
                    return;
                }

                // 存储到 sessionStorage
                if (hotelData.data?.hotels) {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify(hotelData.data.hotels));
                }
                
                renderHotels(hotelData.data.hotels);
            } catch (error) {
                console.error("⛔ Error fetching hotels:", error);
                document.getElementById("hotels").innerHTML = "Failed to fetch hotels.";
            }
        }

        function renderHotels(hotels) {
            const hotelsDiv = document.getElementById("hotels");
            hotelsDiv.innerHTML = "";

            hotels.slice(0, 10).forEach(hotel => {
                try {
                    const hotelCard = document.createElement("div");
                    hotelCard.className = "hotel-card";

                    const hotelImage = hotel.property.photoUrls?.[0] || "https://via.placeholder.com/100";
                    const hotelName = hotel.property.name || "Unknown Hotel";
                    const hotelPrice = hotel.property.priceBreakdown?.grossPrice?.value + " " + hotel.property.priceBreakdown?.grossPrice?.currency || "Price not available";
                    const hotelReview = hotel.property.reviewScoreWord || "No reviews";

                    hotelCard.innerHTML = \`
                        <img class="hotel-image" src="\${hotelImage}" alt="\${hotelName}">
                        <div class="hotel-info">
                            <div class="hotel-name">\${hotelName}</div>
                            <div class="hotel-price">\${hotelPrice}</div>
                            <div class="hotel-review">Review: \${hotelReview}</div>
                        </div>
                    \`;

                    hotelsDiv.appendChild(hotelCard);
                } catch (error) {
                    console.error("⛔ Error rendering hotel:", error);
                }
            });
        }

        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fetchHotels);
        } else {
            fetchHotels();
        }
    </script>
</body>
</html>`,
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

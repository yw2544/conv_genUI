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
      Authorization: `Bearer sk-GTubjBIrqUVOqm8D01KwgIdYzoov0gfUnSzXNVZ3E5P4y5p5`, // 、使用环境变量存储 API Key
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages,
      temperature: config.temperature || 0.7,
      stream: false,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
  const data = await response.json();
  console.log("API Response:", data);
  return data;
  // const reply = data.choices?.[0]?.message?.content || "No response received";
  // console.log("API Response:", reply);
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

async function fetchStockData(symbol: string, interval: string) {
  try {
    console.log(
      `[STOCK] Fetching data for ${symbol} with interval ${interval}`,
    );

    const response = await fetch(
      `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/history?symbol=${symbol}&interval=${interval}&diffandsplits=false`,
      {
        headers: {
          "x-rapidapi-host": "yahoo-finance15.p.rapidapi.com",
          "x-rapidapi-key":
            "73832acacdmsh912a5ba144580abp1e7c32jsn8690baeaba73",
        },
      },
    );

    if (!response.ok) {
      console.error(
        `[STOCK] API Error: ${response.status} ${response.statusText}`,
      );
      throw new Error(`Stock API error: ${response.statusText}`);
    }

    const stockResponse = await response.json();
    console.log(`[STOCK] Raw API response:`, stockResponse);

    if (!stockResponse.body) {
      console.error("[STOCK] Missing 'body' field in API response");
      throw new Error("Stock API returned an invalid format");
    }

    const stockItems = Object.values(stockResponse.body)
      .map((item: any) => ({
        date: item.date,
        date_utc: item.date_utc,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        adjclose: item.adjclose,
      }))
      .sort((a, b) => a.date_utc - b.date_utc)
      .slice(-10);

    const processedData = {
      meta: stockResponse.meta,
      items: stockItems,
    };

    console.log(`[STOCK] Processed data:`, processedData);

    return processedData;
  } catch (error) {
    console.error("[STOCK] Error fetching stock data:", error);
    return null;
  }
}

async function generateStockChartHTML(
  symbol: string,
  interval: string,
  stockdata: any,
) {
  const prompt = `
You are a financial data visualization expert. Generate an HTML page with a stock price chart using Chart.js.

**Stock Data for ${symbol} (${interval} interval):**
${JSON.stringify(stockdata)}

**Instructions:**
1. Extract **dates** and **closing prices** from stock data.
2. Format the dates for display on the X-axis.
3. Use **Chart.js** to render a beautiful **green theme** stock chart.
4. Ensure responsiveness and proper scaling.
5. Return **only the HTML code**, start with <!DOCTYPE html>, end with </html>.

### **HTML Template:**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stock Price Chart</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #1a1a1a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100%;
        }
        .chart-container {
            width: 95%;
            max-width: 900px;
            background: #2a2a2a;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.2);
            margin: 10px auto;
        }
        h2 {
            color: white;
            margin-bottom: 20px;
            text-align: center;
            font-size: 1.2rem;
            padding: 0 10px;
        }
        canvas {
            width: 100% !important;
            height: auto !important;
            max-height: 300px;
        }
        @media (max-width: 600px) {
            .chart-container {
                padding: 10px;
            }
            h2 {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="chart-container">
        <h2>${symbol} Stock Price Trend 📈</h2>
        <canvas id="stockChart"></canvas>
    </div>

    <script>
        function resizeChart() {
            const container = document.querySelector('.chart-container');
            const canvas = document.getElementById('stockChart');
            if (container && canvas) {
                canvas.style.height = Math.min(300, window.innerHeight * 0.6) + 'px';
            }
        }
        
        window.addEventListener('resize', resizeChart);
        document.addEventListener('DOMContentLoaded', resizeChart);
        
        const ctx = document.getElementById('stockChart').getContext('2d');

        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const stockPrices = [150, 155, 160, 162, 158, 165, 170];

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(0, 255, 127, 0.7)");
        gradient.addColorStop(1, "rgba(0, 255, 127, 0.1)");

        const stockData = {
            labels: labels,
            datasets: [{
                label: "Stock Price ($)",
                data: stockPrices,
                borderColor: "rgba(0, 255, 127, 1)",
                backgroundColor: gradient,
                borderWidth: 2,
                pointBackgroundColor: "lime",
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        };

        const chartConfig = {
            type: "line",
            data: stockData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true,
                        labels: {
                            color: 'white',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        displayColors: false,
                        padding: 10
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: false,
                        suggestedMin: Math.min(...stockPrices) - 5,
                        suggestedMax: Math.max(...stockPrices) + 5,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        };

        new Chart(ctx, chartConfig);
        
        
        resizeChart();
    </script>
</body>
</html>
\`\`\`
`;

  const llmResponse = await fetchOpenAI([{ role: "user", content: prompt }], {
    model: "gpt-4o",
    cache: "none" as CacheType, // 修改 "no-cache" 为 "none"
  });
  if (llmResponse.choices[0].message.content.startsWith("```html")) {
    llmResponse.choices[0].message.content =
      llmResponse.choices[0].message.content
        .replace(/^```html\s*/, "")
        .replace(/```$/, "")
        .trim();
    console.log(
      "[DEBUG] Cleaned HTML response:",
      llmResponse.choices[0].message.content,
    );
  }

  return llmResponse.choices[0].message.content;
}

async function handleStockQuery(symbol: string, interval: string) {
  console.log(`[STOCK] Fetching API for ${symbol} (${interval})...`);

  const stockdata = await fetchStockData(symbol, interval);
  if (!stockdata) return `<p>Error fetching stock data for ${symbol}</p>`;

  console.log(`[STOCK] API response received, sending to LLM...`);
  const finalHTML = await generateStockChartHTML(symbol, interval, stockdata);

  console.log(`[STOCK] Final HTML ready, rendering in iframe...`);
  return finalHTML;
}

/** ==========================
 *  1. Fetch Weather Data
 *  ==========================
 */
async function fetchWeatherData(latitude: string, longitude: string) {
  try {
    console.log(
      `[WEATHER] Fetching data for location (${latitude}, ${longitude})`,
    );

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature`,
    );
    const weatherResponse = await response.json();
    console.log(`[WEATHER] Raw API response:`, weatherResponse);

    if (!weatherResponse.hourly || !weatherResponse.hourly.temperature) {
      console.error(
        "[WEATHER] Missing 'hourly.temperature' field in API response",
      );
      throw new Error("Weather API returned an invalid format");
    }

    const times = weatherResponse.hourly.time;
    const temperatures = weatherResponse.hourly.temperature;

    const dailyTemps: Record<string, { high: number; low: number }> = {};

    times.forEach((time: string, index: number) => {
      const date = time.split("T")[0];
      const temp = temperatures[index];

      if (!dailyTemps[date]) {
        dailyTemps[date] = { high: temp, low: temp };
      } else {
        dailyTemps[date].high = Math.max(dailyTemps[date].high, temp);
        dailyTemps[date].low = Math.min(dailyTemps[date].low, temp);
      }
    });

    const processedData = {
      location: { latitude, longitude },
      timezone: weatherResponse.timezone,
      daily: Object.entries(dailyTemps).map(([date, { high, low }]) => ({
        date,
        high,
        low,
      })),
    };

    console.log(`[WEATHER] Processed data:`, processedData);
    return processedData;
  } catch (error) {
    console.error("[WEATHER] Error fetching weather data:", error);
    return null;
  }
}

/** ==========================
 *  2. Generate HTML using LLM
 *  ==========================
 */
async function generateWeatherChartHTML(
  latitude: string,
  longitude: string,
  weatherData: any,
) {
  const prompt = `
You are a meteorological data visualization expert. Generate an HTML page with a **weather temperature chart** using Chart.js.

**Weather Data for location (${latitude}, ${longitude}):**
${JSON.stringify(weatherData)}

**Instructions:**
1. Extract **time** (X-axis) and **temperature** (Y-axis) from weather data.
2. Format the time in 24-hour format (e.g., 08:00, 12:00, 16:00, 20:00).
3. Use **Chart.js** to render a **blue theme** temperature line chart with high and low temperatures.
4. Add weather icons below the dates.
5. Return **only the HTML code**, start with <!DOCTYPE html>, end with </html>.
6. You should use the weather data to generate the chart, not the example data.
7. Be careful with the given data structure, it is different from the example data, generate your own html code that match the givendata structure, not the template， note that you need to infer the city name from the latitude and longitude and include city name in the title instead of the latitude and longitude.
8. Make your html code be responsive, and the layout should be good witho no overlapping in componenets, especially the date and the weather icon..
9. Make sure your html code is correct and can be rendered directly in the browser.

### **HTML Template:**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Temperature Chart</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #1a1a1a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100%;
        }
        .chart-container {
            width: 95%;
            max-width: 900px;
            background: #2a2a2a;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.2);
            margin: 10px auto;
        }
        
        h2 {
            color: white;
            margin-bottom: 15px;
            text-align: center;
            font-size: 1.6rem;
        }
        canvas {
            width: 100% !important;
            height: auto !important;
            max-height: 350px;
        }
        @media (max-width: 600px) {
            .chart-container {
                padding: 10px;
            }
            h2 {
                font-size: 1.4rem;
            }
        }
    </style>
</head>
<body>
    <div class="chart-container">
        <h2>Weather Forecast for New York City 🌦️)</h2>
        <canvas id="weatherChart"></canvas>
    </div>

    <script>
        const ctx = document.getElementById('weatherChart').getContext('2d');
        const labels = ["2025-02-28", "2025-03-01", "2025-03-02", "2025-03-03", "2025-03-04", "2025-03-05", "2025-03-06"];
        const highTemps = [11.2, 10.3, 0, 2.8, 6.8, 11.6, 12.4];
        const lowTemps = [2.5, 0.8, -6.3, -5.1, 0.1, 5.4, 4.8];

        const weatherData = {
            labels: labels,
            datasets: [
                {
                    label: "High Temp (°C)",
                    data: highTemps,
                    borderColor: "rgba(0, 191, 255, 1)",
                    backgroundColor: "rgba(0, 191, 255, 0.2)",
                    borderWidth: 2,
                    pointBackgroundColor: "cyan",
                    pointRadius: 5,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: "Low Temp (°C)",
                    data: lowTemps,
                    borderColor: "rgb(159, 214, 249)",
                    borderWidth: 2,
                    pointBackgroundColor: "lightblue",
                    pointRadius: 5,
                    fill: false,
                    tension: 0.4
                }
            ]
        };

        new Chart(ctx, {
            type: "line",
            data: weatherData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: 'white', font: { size: 12 }, padding:10}
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        displayColors: false,
                        callbacks: {
                            label: (context) => \`\${context.dataset.label}: \${context.parsed.y}°C\`
                            
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'white', font: { size: 12 } , maxRotation: 45, minRotation: 45 }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'white', font: { size: 12 }, callback: (value) => \`\${value}°C\` }
                    }
                },
                layout: { padding: { top: 20, right: 20, left: 10, bottom: 50 } },
                animation: { duration: 1000, easing: 'easeOutQuart' }
            }
        });
    </script>
</body>
</html>
\`\`\`
`;

  const llmResponse = await fetchOpenAI([{ role: "user", content: prompt }], {
    model: "gpt-4o",
    cache: "none" as CacheType,
  });

  if (llmResponse.choices[0].message.content.startsWith("```html")) {
    llmResponse.choices[0].message.content =
      llmResponse.choices[0].message.content
        .replace(/^```html\s*/, "")
        .replace(/```$/, "")
        .trim();
    console.log(
      "[DEBUG] Cleaned HTML response:",
      llmResponse.choices[0].message.content,
    );
  }
  return llmResponse.choices[0].message.content;
}

/** ==========================
 *  3. Handle Weather Query
 *  ==========================
 */
async function handleWeatherQuery(latitude: string, longitude: string) {
  console.log(`[WEATHER] Fetching API for (${latitude}, ${longitude})...`);

  const weatherData = await fetchWeatherData(latitude, longitude);
  if (!weatherData) {
    console.error("[WEATHER] No weather data received");
    throw new Error("No weather data available");
  }

  console.log(`[WEATHER] API response received, sending to LLM...`);
  const finalHTML = await generateWeatherChartHTML(
    latitude,
    longitude,
    weatherData,
  );

  if (!finalHTML) {
    console.error("[WEATHER] No HTML generated");
    throw new Error("Failed to generate weather chart");
  }

  console.log(`[WEATHER] Final HTML ready, length: ${finalHTML.length}`);
  return finalHTML;
}

/** ==========================
 *  4. Process Weather Response
 *  ==========================
 */
let weatherHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Temperature Chart</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #1a1a1a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100%;
        }
        .chart-container {
            width: 95%;
            max-width: 900px;
            background: #2a2a2a;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.2);
            margin: 10px auto;
        }
        .weather-icon {
            width: 30px;
            height: 30px;
            display: block;
            margin: 5px auto;
            text-align: center;
        }
        h2 {
            color: white;
            margin-bottom: 15px;
            text-align: center;
            font-size: 1.4rem;
        }
        canvas {
            width: 100% !important;
            height: auto !important;
            max-height: 300px;
        }
        @media (max-width: 600px) {
            .chart-container {
                padding: 10px;
            }
            h2 {
                font-size: 1.2rem;
            }
        }
    </style>
</head>
<body>
    <div class="chart-container">
        <h2>Weather Forecast for New York</h2>
        <canvas id="weatherChart"></canvas>
    </div>

    <script>
        const ctx = document.getElementById('weatherChart').getContext('2d');
        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const highTemps = [22, 24, 26, 28, 27, 25, 23];
        const lowTemps = [14, 16, 18, 20, 19, 17, 15];
        const weatherTypes = ["☀️", "🌤️", "⛅", "🌧️", "🌦️", "☁️", "⛈️"];

        const weatherData = {
            labels: labels,
            datasets: [
                {
                    label: "High Temp (°C)",
                    data: highTemps,
                    borderColor: "rgba(0, 191, 255, 1)",
                    backgroundColor: "rgba(0, 191, 255, 0.2)",
                    borderWidth: 2,
                    pointBackgroundColor: "cyan",
                    pointRadius: 5,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: "Low Temp (°C)",
                    data: lowTemps,
                    borderColor: "rgba(135, 206, 250, 1)",
                    borderWidth: 2,
                    pointBackgroundColor: "lightblue",
                    pointRadius: 5,
                    fill: false,
                    tension: 0.4
                }
            ]
        };

        const weatherIcons = {
            id: "weatherIcons",
            afterDatasetsDraw(chart) {
                const { ctx, scales: { x, y } } = chart;
                ctx.save();
                labels.forEach((label, i) => {
                    const icon = weatherTypes[i];
                    ctx.font = "20px Arial";
                    const xPos = x.getPixelForValue(i) - 10;
                    ctx.fillText(icon, xPos, y.bottom + 35); // 调整图标位置，使其位于日期下方
                });
                ctx.restore();
            }
        };

        new Chart(ctx, {
            type: "line",
            data: weatherData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: 'white', font: { size: 12 } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        displayColors: false,
                        callbacks: {
                            label: (context) => \`\${context.dataset.label}: \${context.parsed.y}°C\`,
                            title: (tooltipItems) => \`\${labels[tooltipItems[0].dataIndex]} \${weatherTypes[tooltipItems[0].dataIndex]}\`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'white', font: { size: 12 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'white', font: { size: 12 }, callback: (value) => \`\${value}°C\` }
                    }
                },
                layout: { padding: { top: 20, right: 20, left: 10, bottom: 50 } },
                animation: { duration: 1000, easing: 'easeOutQuart' }
            },
            plugins: [weatherIcons]
        });
    </script>
</body>
</html>
`;

export async function processGPTResponse(response: string) {
  const weatherMatch = response.match(
    /(.+)\.\_weather\_([+-]?\d+\.\d+)\_([+-]?\d+\.\d+)$/,
  );
  if (weatherMatch) {
    const [_, content, latitude, longitude] = weatherMatch;

    try {
      const generatedWeatherHtml = await handleWeatherQuery(
        latitude,
        longitude,
      );
      if (generatedWeatherHtml) {
        weatherHtml = generatedWeatherHtml;
      }
      console.log("[WEATHER] Final response HTML length:", weatherHtml?.length);

      return {
        content: content.trim(),
        showWeather: true,
        weatherData: weatherHtml,
        showStock: false,
        stockData: "",
        showFlight: false,
        flightData: "",
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
    } catch (error) {
      console.error("[WEATHER] Error in processGPTResponse:", error);
      return {
        content: content.trim(),
        showWeather: false,
        weatherData: "",
        showStock: false,
        stockData: "",
        showFlight: false,
        flightData: "",
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
  }

  const stockMatch = response.match(/(.+)\.\_stock\_([A-Z]+)\_([a-z0-9]+)/);
  if (stockMatch) {
    const [_, content, symbol, interval] = stockMatch;

    let stockHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stock Price Chart</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #1a1a1a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100%;
        }
        .chart-container {
            width: 95%;
            max-width: 900px;
            background: #2a2a2a;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.2);
            margin: 10px auto;
        }
        h2 {
            color: white;
            margin-bottom: 20px;
            text-align: center;
            font-size: 1.2rem;
            padding: 0 10px;
        }
        canvas {
            width: 100% !important;
            height: auto !important;
            max-height: 300px;
        }
        @media (max-width: 600px) {
            .chart-container {
                padding: 10px;
            }
            h2 {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="chart-container">
        <h2>${symbol} Stock Price Trend 📈</h2>
        <canvas id="stockChart"></canvas>
    </div>

    <script>
        function resizeChart() {
            const container = document.querySelector('.chart-container');
            const canvas = document.getElementById('stockChart');
            if (container && canvas) {
                canvas.style.height = Math.min(300, window.innerHeight * 0.6) + 'px';
            }
        }
        
        window.addEventListener('resize', resizeChart);
        document.addEventListener('DOMContentLoaded', resizeChart);
        
        const ctx = document.getElementById('stockChart').getContext('2d');

        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const stockPrices = [150, 155, 160, 162, 158, 165, 170];

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(0, 255, 127, 0.7)");
        gradient.addColorStop(1, "rgba(0, 255, 127, 0.1)");

        const stockData = {
            labels: labels,
            datasets: [{
                label: "Stock Price ($)",
                data: stockPrices,
                borderColor: "rgba(0, 255, 127, 1)",
                backgroundColor: gradient,
                borderWidth: 2,
                pointBackgroundColor: "lime",
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        };

        const chartConfig = {
            type: "line",
            data: stockData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true,
                        labels: {
                            color: 'white',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        displayColors: false,
                        padding: 10
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: false,
                        suggestedMin: Math.min(...stockPrices) - 5,
                        suggestedMax: Math.max(...stockPrices) + 5,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        };

        new Chart(ctx, chartConfig);
        
        resizeChart();
    </script>
</body>
</html>`;

    try {
      const generatedHtml = await handleStockQuery(symbol, interval);
      if (generatedHtml) {
        stockHtml = generatedHtml;
      }
    } catch (error) {
      console.error("Error generating stock chart:", error);
    }

    return {
      content,
      showStock: true,
      stockData: stockHtml,
      showFlight: false,
      flightData: "",
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

  const calculatorMatch = response.match(/(.+)\.\_calculator/);
  console.log("Calculator match:", calculatorMatch);

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
    showStock: false,
    stockData: "",
    showWeather: false,
    weatherData: "",
  };
}

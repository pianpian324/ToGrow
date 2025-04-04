
import { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

// Mock data for solar terms - in real app, would be calculated based on astronomical calculations
const solarTerms = [
  { name: "立春", date: "2月4日", description: "春季的开始，万物复苏" },
  { name: "雨水", date: "2月19日", description: "降雨开始，雨量渐增" },
  { name: "惊蛰", date: "3月5日", description: "春雷乍动，惊醒蛰伏的昆虫" },
  { name: "春分", date: "3月20日", description: "昼夜平分，春季中期" },
  { name: "清明", date: "4月4日", description: "天气清爽明朗，祭祀祖先" },
  { name: "谷雨", date: "4月20日", description: "雨生百谷，播种好时节" },
  { name: "立夏", date: "5月5日", description: "夏季的开始，气温升高" },
  { name: "小满", date: "5月21日", description: "夏熟作物籽粒开始饱满" },
  { name: "芒种", date: "6月6日", description: "有芒的谷物可以种植" },
  { name: "夏至", date: "6月21日", description: "一年中白昼最长的一天" },
  { name: "小暑", date: "7月7日", description: "开始进入炎热季节" },
  { name: "大暑", date: "7月22日", description: "一年中最热的时期" },
  { name: "立秋", date: "8月7日", description: "秋季的开始，暑去凉来" },
  { name: "处暑", date: "8月23日", description: "炎热天气结束" },
  { name: "白露", date: "9月7日", description: "天气转凉，开始有露水" },
  { name: "秋分", date: "9月23日", description: "昼夜平分，秋季中期" },
  { name: "寒露", date: "10月8日", description: "露水更冷，将要结霜" },
  { name: "霜降", date: "10月23日", description: "开始有霜，气温下降" },
  { name: "立冬", date: "11月7日", description: "冬季的开始，万物收藏" },
  { name: "小雪", date: "11月22日", description: "开始下雪，但雪量不大" },
  { name: "大雪", date: "12月7日", description: "雪量增大，地面可能积雪" },
  { name: "冬至", date: "12月22日", description: "一年中白昼最短的一天" },
  { name: "小寒", date: "1月5日", description: "开始进入寒冷季节" },
  { name: "大寒", date: "1月20日", description: "一年中最冷的时期" },
];

// Mock weather data - would be fetched from API in real app
const mockWeatherData = {
  temperature: 22,
  humidity: 65,
  windSpeed: 3.5,
  condition: "晴朗", // 晴朗, 多云, 雨天, etc.
  forecast: [
    { date: "今天", temperature: 22, condition: "晴朗" },
    { date: "明天", temperature: 20, condition: "多云" },
    { date: "后天", temperature: 18, condition: "小雨" },
  ],
  warnings: [
    { type: "温度", message: "明日温度将骤降6℃，请做好保暖措施", level: "中" },
  ],
};

// Helper function to get the current solar term
const getCurrentSolarTerm = () => {
  const today = new Date();
  // This is a simplification - in a real app would use astronomical calculations
  const monthIndex = today.getMonth();
  const day = today.getDate();
  
  // Simple approximation for demo purposes
  const index = ((monthIndex * 2) + (day > 15 ? 1 : 0)) % 24;
  return solarTerms[index];
};

// Weather icon component based on condition
const WeatherIcon = ({ condition }: { condition: string }) => {
  switch (condition) {
    case "晴朗":
      return <Sun className="h-12 w-12 text-greencity-sun" />;
    case "多云":
      return <Cloud className="h-12 w-12 text-greencity-sky" />;
    case "小雨":
    case "中雨":
    case "大雨":
      return <CloudRain className="h-12 w-12 text-greencity-sky" />;
    default:
      return <Sun className="h-12 w-12 text-greencity-sun" />;
  }
};

const SolarTermWeather = () => {
  const [currentTerm, setCurrentTerm] = useState(getCurrentSolarTerm());
  const [weather, setWeather] = useState(mockWeatherData);

  useEffect(() => {
    // In a real app, would fetch real-time data from API
    // fetchWeatherData().then(data => setWeather(data));
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Solar Term Card */}
        <Card className="bg-gradient-to-br from-greencity-primary/10 to-greencity-light/20 dark:from-greencity-primary/20 dark:to-greencity-dark p-4">
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold text-greencity-primary">当前节气</h3>
            <div className="text-4xl font-bold my-3">{currentTerm.name}</div>
            <div className="text-gray-600 dark:text-gray-300">{currentTerm.date}</div>
            <p className="mt-2 text-center">{currentTerm.description}</p>
          </div>
        </Card>

        {/* Current Weather Card */}
        <Card className="weather-card col-span-1 md:col-span-2">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-xl font-bold text-greencity-primary mb-2">当前天气</h3>
              <div className="text-3xl font-bold">{weather.temperature}°C</div>
              <div className="text-gray-600 dark:text-gray-300">{weather.condition}</div>
            </div>
            <div className="flex flex-col items-center mt-4 md:mt-0">
              <WeatherIcon condition={weather.condition} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="flex flex-col items-center">
              <Droplets className="h-6 w-6 text-greencity-sky" />
              <div className="text-sm mt-1">湿度</div>
              <div className="font-bold">{weather.humidity}%</div>
            </div>
            <div className="flex flex-col items-center">
              <Wind className="h-6 w-6 text-greencity-sky" />
              <div className="text-sm mt-1">风速</div>
              <div className="font-bold">{weather.windSpeed} m/s</div>
            </div>
            <div className="flex flex-col items-center">
              <Thermometer className="h-6 w-6 text-greencity-sky" />
              <div className="text-sm mt-1">体感</div>
              <div className="font-bold">{weather.temperature - 1}°C</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 3-Day Forecast */}
      <Card className="p-4">
        <h3 className="text-xl font-bold text-greencity-primary mb-4">三日预报</h3>
        <div className="grid grid-cols-3 gap-4">
          {weather.forecast.map((day) => (
            <div key={day.date} className="flex flex-col items-center p-2">
              <div className="font-semibold">{day.date}</div>
              <WeatherIcon condition={day.condition} />
              <div className="font-bold mt-2">{day.temperature}°C</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{day.condition}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weather Warnings */}
      {weather.warnings.length > 0 && (
        <Card className="p-4 border-l-4 border-amber-500">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-amber-500 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-amber-500">天气预警</h3>
              {weather.warnings.map((warning, index) => (
                <div key={index} className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 mr-2">
                    {warning.type} - {warning.level}级
                  </span>
                  <span>{warning.message}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SolarTermWeather;

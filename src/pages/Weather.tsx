
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SolarTermWeather from "@/components/SolarTermWeather";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Sun, Moon, CloudRain, Wind, Thermometer } from "lucide-react";

// Mock solar terms calendar - in a real app, would be calculated dynamically
const solarTermsCalendar = [
  { name: "小寒", date: "2024-01-05", description: "开始进入寒冷季节" },
  { name: "大寒", date: "2024-01-20", description: "一年中最冷的时期" },
  { name: "立春", date: "2024-02-04", description: "春季的开始，万物复苏" },
  { name: "雨水", date: "2024-02-19", description: "降雨开始，雨量渐增" },
  { name: "惊蛰", date: "2024-03-05", description: "春雷乍动，惊醒蛰伏的昆虫" },
  { name: "春分", date: "2024-03-20", description: "昼夜平分，春季中期" },
  { name: "清明", date: "2024-04-04", description: "天气清爽明朗，祭祀祖先" },
  { name: "谷雨", date: "2024-04-20", description: "雨生百谷，播种好时节" },
  { name: "立夏", date: "2024-05-05", description: "夏季的开始，气温升高" },
  { name: "小满", date: "2024-05-21", description: "夏熟作物籽粒开始饱满" },
  { name: "芒种", date: "2024-06-06", description: "有芒的谷物可以种植" },
  { name: "夏至", date: "2024-06-21", description: "一年中白昼最长的一天" },
];

// Mock environment monitoring data
const environmentData = [
  { date: "04-01", temperature: 22, humidity: 65, rainfall: 0, sunshine: 7.5 },
  { date: "04-02", temperature: 21, humidity: 68, rainfall: 0, sunshine: 6.5 },
  { date: "04-03", temperature: 23, humidity: 62, rainfall: 0, sunshine: 8.0 },
  { date: "04-04", temperature: 20, humidity: 70, rainfall: 5, sunshine: 3.5 },
  { date: "04-05", temperature: 19, humidity: 75, rainfall: 8, sunshine: 2.0 },
  { date: "04-06", temperature: 18, humidity: 73, rainfall: 2, sunshine: 4.5 },
  { date: "04-07", temperature: 20, humidity: 68, rainfall: 0, sunshine: 6.0 },
];

// Mock planting suggestions
const plantingSuggestions = [
  { 
    activity: "播种", 
    plants: ["小白菜", "生菜", "菠菜"],
    reason: "清明时节气温适宜，雨水充足，非常适合叶菜类蔬菜播种"
  },
  { 
    activity: "定植", 
    plants: ["番茄", "辣椒", "茄子"],
    reason: "温度逐渐回升，夜间温度稳定在15℃以上，可以定植喜温的果菜类"
  },
  { 
    activity: "收获", 
    plants: ["油菜", "菠菜", "香菜"],
    reason: "越冬蔬菜已经成熟，应及时收获以释放种植空间"
  },
  { 
    activity: "田间管理", 
    plants: ["豌豆", "蚕豆", "大蒜"],
    reason: "及时疏松土壤，促进根系通气，清理杂草避免养分竞争"
  },
];

const Weather = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">节气天气预报</h1>
            <p className="text-gray-600 dark:text-gray-400">
              基于二十四节气的智能天气预报，让您的种植更符合自然规律。
            </p>
          </div>
          
          <SolarTermWeather />
          
          <div className="mt-12">
            <Tabs defaultValue="calendar">
              <TabsList className="mb-6">
                <TabsTrigger value="calendar" className="data-[state=active]:bg-greencity-primary data-[state=active]:text-white">
                  <Calendar className="h-4 w-4 mr-2" />
                  节气日历
                </TabsTrigger>
                <TabsTrigger value="data" className="data-[state=active]:bg-greencity-primary data-[state=active]:text-white">
                  <Thermometer className="h-4 w-4 mr-2" />
                  环境监测
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="data-[state=active]:bg-greencity-primary data-[state=active]:text-white">
                  <Sun className="h-4 w-4 mr-2" />
                  种植建议
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="calendar">
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">2024年节气日历</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {solarTermsCalendar.map((term) => (
                      <div key={term.name} className="border rounded-lg p-4 hover:border-greencity-primary hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold">{term.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              {new Date(term.date).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-greencity-primary/10 flex items-center justify-center">
                            <Sun className="h-5 w-5 text-greencity-primary" />
                          </div>
                        </div>
                        <p className="mt-3 text-sm">{term.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="data">
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">环境监测数据</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-greencity-primary/10">
                          <th className="border p-2 text-left">日期</th>
                          <th className="border p-2 text-left">
                            <div className="flex items-center">
                              <Thermometer className="h-4 w-4 mr-1" />
                              温度 (°C)
                            </div>
                          </th>
                          <th className="border p-2 text-left">
                            <div className="flex items-center">
                              <CloudRain className="h-4 w-4 mr-1" />
                              湿度 (%)
                            </div>
                          </th>
                          <th className="border p-2 text-left">
                            <div className="flex items-center">
                              <CloudRain className="h-4 w-4 mr-1" />
                              降雨量 (mm)
                            </div>
                          </th>
                          <th className="border p-2 text-left">
                            <div className="flex items-center">
                              <Sun className="h-4 w-4 mr-1" />
                              日照 (h)
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {environmentData.map((day) => (
                          <tr key={day.date} className="hover:bg-greencity-primary/5">
                            <td className="border p-2">{day.date}</td>
                            <td className="border p-2">{day.temperature}</td>
                            <td className="border p-2">{day.humidity}</td>
                            <td className="border p-2">{day.rainfall}</td>
                            <td className="border p-2">{day.sunshine}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-bold mb-2">环境趋势分析</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      近期天气总体平稳，温度在18-23°C之间波动，适合大多数春季蔬菜生长。4月4日至5日有少量降水，湿度增加，注意防止病害发生。整体日照充足，有利于植物光合作用。
                    </p>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="suggestions">
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">清明节气种植建议</h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-400">
                    清明节气是春季重要的农事季节，气温回升，雨水充沛，非常适合多种蔬菜的播种和管理。根据您的地理位置和当前环境数据，我们为您提供以下种植建议。
                  </p>
                  
                  <div className="space-y-4">
                    {plantingSuggestions.map((suggestion, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:border-greencity-primary hover:shadow-sm transition-all">
                        <h3 className="font-bold text-lg mb-2">{suggestion.activity}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {suggestion.plants.map((plant) => (
                            <span key={plant} className="bg-greencity-primary/10 text-greencity-primary px-2 py-1 rounded-full text-sm">
                              {plant}
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{suggestion.reason}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="font-bold flex items-center text-amber-700 mb-2">
                      <Sun className="h-5 w-5 mr-2" />
                      特别提示
                    </h3>
                    <p className="text-amber-700">
                      清明时节雨纷纷，注意做好排水措施，避免植物根部浸泡导致腐烂。新种植的幼苗应做好防寒保护，以防倒春寒影响生长。
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Weather;

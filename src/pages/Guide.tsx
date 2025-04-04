import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlantingGuide from "@/components/PlantingGuide";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Leaf, Sprout, Sun, Thermometer, Droplet, 
  CalendarDays, AlertTriangle, BookOpen 
} from "lucide-react";

// Mock plant database - would be fetched from API in real app
const popularPlants = [
  {
    name: "小白菜",
    image: "https://p.lovethee.cn/uploads/allimg/190711/211I00I7-0.jpg",
    difficulty: 1,
    growTime: "30-40天",
    season: "春秋",
    description: "适合新手种植的快速生长蔬菜"
  },
  {
    name: "生菜",
    image: "https://img.zcool.cn/community/01af6d5980a1f4a8012060be1e7f9c.jpg",
    difficulty: 2,
    growTime: "40-50天",
    season: "春秋",
    description: "多种类型可选，喜凉爽气候"
  },
  {
    name: "香菜",
    image: "https://img.freepik.com/free-photo/fresh-coriander-leaves_1339-1402.jpg",
    difficulty: 1,
    growTime: "30-40天",
    season: "春秋",
    description: "常用香料，易种植，生命力强"
  },
  {
    name: "樱桃番茄",
    image: "https://img.freepik.com/free-photo/cherry-tomatoes_74190-2529.jpg",
    difficulty: 3,
    growTime: "60-80天",
    season: "夏",
    description: "果实小巧，产量大，需支架"
  },
  {
    name: "青椒",
    image: "https://img.freepik.com/free-photo/green-bell-peppers_144627-27521.jpg",
    difficulty: 3,
    growTime: "70-90天",
    season: "夏",
    description: "喜温喜光，需肥沃土壤"
  },
  {
    name: "绿葱",
    image: "https://img.freepik.com/free-photo/bunch-mature-green-onion_144627-13219.jpg",
    difficulty: 2,
    growTime: "30-45天",
    season: "四季",
    description: "可重复收获，生长快速"
  }
];

// Mock planting knowledge base
const plantingKnowledge = [
  {
    title: "城市阳台种植基础",
    topics: ["容器选择", "土壤配制", "肥料使用", "浇水技巧"],
    level: "入门"
  },
  {
    title: "有机无农药种植",
    topics: ["天然肥料", "生物防治", "混合种植", "轮作计划"],
    level: "进阶"
  },
  {
    title: "垂直种植空间利用",
    topics: ["立体种植架", "墙面种植袋", "悬挂式花盆", "阶梯式设计"],
    level: "进阶"
  },
  {
    title: "种子育苗技术",
    topics: ["发芽处理", "营养土配方", "温湿度控制", "光照管理"],
    level: "入门"
  }
];

// Render difficulty level based on number
const DifficultyLevel = ({ level }: { level: number }) => {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Leaf 
          key={i} 
          className={`h-4 w-4 ${
            i < level ? "text-greencity-primary" : "text-gray-300"
          }`} 
        />
      ))}
    </div>
  );
};

const Guide = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">种植指导引擎</h1>
            <p className="text-gray-600 dark:text-gray-400">
              智能分析您的种植环境，提供个性化的种植方案和建议。
            </p>
          </div>
          
          <PlantingGuide />
          
          <div className="mt-12">
            <Tabs defaultValue="popular">
              <TabsList className="mb-6">
                <TabsTrigger value="popular" className="data-[state=active]:bg-greencity-primary data-[state=active]:text-white">
                  <Sprout className="h-4 w-4 mr-2" />
                  热门植物
                </TabsTrigger>
                <TabsTrigger value="seasonal" className="data-[state=active]:bg-greencity-primary data-[state=active]:text-white">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  应季推荐
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="data-[state=active]:bg-greencity-primary data-[state=active]:text-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  种植知识库
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="popular">
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">热门种植植物</h2>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        className="w-full pl-10 pr-4 py-2 border rounded-md"
                        placeholder="搜索植物..."
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {popularPlants.map((plant) => (
                      <div key={plant.name} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-48 overflow-hidden">
                          <img
                            src={plant.image}
                            alt={plant.name}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold mb-1">{plant.name}</h3>
                            <DifficultyLevel level={plant.difficulty} />
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            {plant.description}
                          </p>
                          <div className="flex justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <Sprout className="h-4 w-4 mr-1 text-greencity-primary" />
                              {plant.growTime}
                            </div>
                            <div className="flex items-center">
                              <Sun className="h-4 w-4 mr-1 text-greencity-primary" />
                              {plant.season}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="seasonal">
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-6">春季种植推荐</h2>
                  
                  <div className="bg-greencity-primary/10 p-4 rounded-lg mb-6">
                    <div className="flex items-start">
                      <CalendarDays className="h-6 w-6 text-greencity-primary mr-3 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-greencity-primary">当前节气：清明</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          清明时节雨纷纷，是播种和移栽的好时机。气温回升，降水增多，土壤湿度适宜，非常适合各类蔬菜的种植。
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center">
                        <Leaf className="h-5 w-5 mr-2 text-greencity-primary" />
                        叶菜类
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4 hover:border-greencity-primary transition-colors">
                          <h4 className="font-bold">小白菜</h4>
                          <div className="flex justify-between text-sm text-gray-500 mt-2">
                            <div className="flex items-center">
                              <Thermometer className="h-4 w-4 mr-1 text-greencity-primary" />
                              15-25°C
                            </div>
                            <div className="flex items-center">
                              <Droplet className="h-4 w-4 mr-1 text-greencity-primary" />
                              中等
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 hover:border-greencity-primary transition-colors">
                          <h4 className="font-bold">生菜</h4>
                          <div className="flex justify-between text-sm text-gray-500 mt-2">
                            <div className="flex items-center">
                              <Thermometer className="h-4 w-4 mr-1 text-greencity-primary" />
                              10-22°C
                            </div>
                            <div className="flex items-center">
                              <Droplet className="h-4 w-4 mr-1 text-greencity-primary" />
                              中等
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 hover:border-greencity-primary transition-colors">
                          <h4 className="font-bold">菠菜</h4>
                          <div className="flex justify-between text-sm text-gray-500 mt-2">
                            <div className="flex items-center">
                              <Thermometer className="h-4 w-4 mr-1 text-greencity-primary" />
                              15-20°C
                            </div>
                            <div className="flex items-center">
                              <Droplet className="h-4 w-4 mr-1 text-greencity-primary" />
                              中高
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center">
                        <Sprout className="h-5 w-5 mr-2 text-greencity-primary" />
                        根茎类
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4 hover:border-greencity-primary transition-colors">
                          <h4 className="font-bold">萝卜</h4>
                          <div className="flex justify-between text-sm text-gray-500 mt-2">
                            <div className="flex items-center">
                              <Thermometer className="h-4 w-4 mr-1 text-greencity-primary" />
                              15-20°C
                            </div>
                            <div className="flex items-center">
                              <Droplet className="h-4 w-4 mr-1 text-greencity-primary" />
                              中等
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 hover:border-greencity-primary transition-colors">
                          <h4 className="font-bold">胡萝卜</h4>
                          <div className="flex justify-between text-sm text-gray-500 mt-2">
                            <div className="flex items-center">
                              <Thermometer className="h-4 w-4 mr-1 text-greencity-primary" />
                              15-25°C
                            </div>
                            <div className="flex items-center">
                              <Droplet className="h-4 w-4 mr-1 text-greencity-primary" />
                              中等
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 hover:border-greencity-primary transition-colors">
                          <h4 className="font-bold">土豆</h4>
                          <div className="flex justify-between text-sm text-gray-500 mt-2">
                            <div className="flex items-center">
                              <Thermometer className="h-4 w-4 mr-1 text-greencity-primary" />
                              15-20°C
                            </div>
                            <div className="flex items-center">
                              <Droplet className="h-4 w-4 mr-1 text-greencity-primary" />
                              中等
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="font-bold flex items-center text-amber-700 mb-2">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      种植风险提示
                    </h3>
                    <p className="text-amber-700">
                      清明前后温差较大，夜间温度可能降至10°C以下，对茄果类蔬菜不利。建议敏感作物做好保温措施，或推迟到谷雨后种植。
                    </p>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="knowledge">
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-6">种植知识库</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plantingKnowledge.map((item, index) => (
                      <div key={index} className="border rounded-lg p-6 hover:border-greencity-primary hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold">{item.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.level === "入门" 
                              ? "bg-greencity-primary/10 text-greencity-primary" 
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {item.level}
                          </span>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          {item.topics.map((topic, i) => (
                            <div key={i} className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-greencity-primary mr-2"></div>
                              <span>{topic}</span>
                            </div>
                          ))}
                        </div>
                        
                        <button className="mt-6 w-full py-2 border border-greencity-primary text-greencity-primary rounded-md hover:bg-greencity-primary/10 transition-colors">
                          查看详情
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 text-center">
                    <h3 className="font-bold mb-2">没有找到您需要的内容？</h3>
                    <div className="relative max-w-md mx-auto">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        className="w-full pl-10 pr-4 py-2 border rounded-md"
                        placeholder="搜索种植知识..."
                      />
                    </div>
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

export default Guide;

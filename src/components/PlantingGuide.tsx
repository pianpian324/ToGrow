
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapPin, Sun, Thermometer, Droplet, Clock, Sprout, AlertCircle, Leaf } from "lucide-react";

// Plant suggestions based on conditions - would be fetched from a database in real app
const plantSuggestions = [
  {
    name: "小白菜",
    image: "https://p.lovethee.cn/uploads/allimg/190711/211I00I7-0.jpg",
    suitableTemp: "15-25℃",
    soil: "pH值: 6.0-7.0，排水良好的土壤",
    growthCycle: "30-40天",
    companionPlants: "大蒜，香菜",
    pestManagement: "喷洒大蒜水防治蚜虫",
    difficultyLevel: 1,
    description: "适合新手种植的快速生长蔬菜，耐寒性好"
  },
  {
    name: "生菜",
    image: "https://img.zcool.cn/community/01af6d5980a1f4a8012060be1e7f9c.jpg",
    suitableTemp: "10-22℃",
    soil: "pH值: 6.0-6.8，富含腐殖质的土壤",
    growthCycle: "40-50天",
    companionPlants: "胡萝卜，黄瓜",
    pestManagement: "使用天然除虫菊杀虫",
    difficultyLevel: 2,
    description: "喜凉爽气候，适合春秋种植，需要良好的水分管理"
  },
  {
    name: "樱桃番茄",
    image: "https://img.freepik.com/free-photo/cherry-tomatoes_74190-2529.jpg",
    suitableTemp: "20-30℃",
    soil: "pH值: 6.0-6.8，富含有机质的疏松土壤",
    growthCycle: "60-80天",
    companionPlants: "罗勒，万寿菊",
    pestManagement: "轮作，植物性杀虫剂",
    difficultyLevel: 3,
    description: "需要充足阳光和支架，结果量大，口感佳"
  }
];

// Difficulty level render function
const DifficultyLevel = ({ level }: { level: number }) => {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Leaf 
          key={i} 
          className={`h-4 w-4 mr-1 ${
            i < level ? "text-greencity-primary" : "text-gray-300"
          }`} 
        />
      ))}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
        {level === 1 ? "新手友好" : level === 2 ? "初级" : level === 3 ? "中级" : level === 4 ? "高级" : "专家级"}
      </span>
    </div>
  );
};

const PlantingGuide = () => {
  const [location, setLocation] = useState("");
  const [scene, setScene] = useState("");
  const [container, setContainer] = useState("");
  const [sunlight, setSunlight] = useState([4]);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
    // In a real app, would call an API to get recommendations based on inputs
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-greencity-dark/30">
        <h2 className="text-2xl font-bold mb-4">智能种植方案生成器</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                您的位置
              </label>
              <Input
                placeholder="输入您的城市"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">种植场景</label>
              <Select value={scene} onValueChange={setScene}>
                <SelectTrigger>
                  <SelectValue placeholder="选择种植场景" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balcony">阳台</SelectItem>
                  <SelectItem value="roof">屋顶</SelectItem>
                  <SelectItem value="garden">社区菜园</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">容器类型</label>
              <Select value={container} onValueChange={setContainer}>
                <SelectTrigger>
                  <SelectValue placeholder="选择容器类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pot">盆栽</SelectItem>
                  <SelectItem value="planter">种植箱</SelectItem>
                  <SelectItem value="raised">高架种植床</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium flex items-center gap-1">
                <Sun className="h-4 w-4" />
                日光照射时长 ({sunlight[0]}小时/天)
              </label>
              <Slider
                value={sunlight}
                onValueChange={setSunlight}
                min={0}
                max={12}
                step={1}
                className="w-full"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-greencity-primary hover:bg-greencity-dark">
            生成种植方案
          </Button>
        </form>
      </Card>

      {showResults && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">适合您条件的推荐植物</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plantSuggestions.map((plant) => (
              <Card key={plant.name} className="plant-card overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-bold">{plant.name}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{plant.description}</p>
                  
                  <DifficultyLevel level={plant.difficultyLevel} />
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Thermometer className="h-4 w-4 mt-1 text-greencity-primary" />
                      <span>适宜温度: {plant.suitableTemp}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Droplet className="h-4 w-4 mt-1 text-greencity-primary" />
                      <span>土壤条件: {plant.soil}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-1 text-greencity-primary" />
                      <span>生长周期: {plant.growthCycle}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sprout className="h-4 w-4 mt-1 text-greencity-primary" />
                      <span>伴生植物: {plant.companionPlants}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-1 text-greencity-primary" />
                      <span>病虫害防治: {plant.pestManagement}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4 bg-greencity-primary hover:bg-greencity-dark">
                    查看详细种植指南
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantingGuide;

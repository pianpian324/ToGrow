
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Camera, Plus, Image, Edit, FileText, Calendar, Thermometer, Droplet, Sun } from "lucide-react";

// Mock diary entries - would be stored/retrieved from a database in a real app
const mockDiaryEntries = [
  {
    id: 1,
    date: "2024-04-01",
    plantName: "小白菜",
    stage: "苗期",
    content: "小白菜已经长出了4片真叶，看起来很健康。今天给它们添加了一些有机肥料，希望能帮助它们更好地生长。",
    imageUrl: "https://p.lovethee.cn/uploads/allimg/190711/211I00I7-0.jpg",
    temperature: 22,
    humidity: 65,
    light: "中等"
  },
  {
    id: 2,
    date: "2024-03-25",
    plantName: "小白菜",
    stage: "播种期",
    content: "今天播种了小白菜，使用了有机种子和优质的培养土。期待它们的生长过程！",
    imageUrl: "https://img95.699pic.com/photo/40094/7869.jpg_wh300.jpg",
    temperature: 20,
    humidity: 70,
    light: "弱"
  }
];

// Plant stage guide - simplified for this demo
const plantStageGuide = {
  "播种期": {
    tips: ["保持土壤湿润但不过湿", "温度保持在18-22℃", "通风良好但避免直接吹风"],
    duration: "7-10天",
    nextStage: "苗期"
  },
  "苗期": {
    tips: ["每天至少4小时阳光", "当出现2-4片真叶时可以间苗", "适当控制浇水避免徒长"],
    duration: "15-20天",
    nextStage: "生长期"
  },
  "生长期": {
    tips: ["每周施一次稀薄的有机肥", "保持充足阳光", "注意防治病虫害"],
    duration: "20-30天",
    nextStage: "收获期"
  },
  "收获期": {
    tips: ["选择早晨采收蔬菜", "可以分批采收延长供应期", "记录产量和品质改进下次种植"],
    duration: "7-14天",
    nextStage: "完成"
  }
};

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('zh-CN', options);
};

const PlantingDiary = () => {
  const [activeTab, setActiveTab] = useState("entries");
  const [diaryEntries, setDiaryEntries] = useState(mockDiaryEntries);
  const [newEntry, setNewEntry] = useState({
    plantName: "",
    stage: "",
    content: "",
    temperature: 22,
    humidity: 65,
    light: "中等"
  });

  const handleCreateEntry = () => {
    // In a real app, would save to database
    const today = new Date().toISOString().split('T')[0];
    
    setDiaryEntries([
      {
        id: diaryEntries.length + 1,
        date: today,
        ...newEntry,
        imageUrl: "https://via.placeholder.com/300x200?text=Plant+Image"
      },
      ...diaryEntries
    ]);
    
    // Reset form
    setNewEntry({
      plantName: "",
      stage: "",
      content: "",
      temperature: 22,
      humidity: 65,
      light: "中等"
    });
    
    // Switch to entries tab
    setActiveTab("entries");
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="bg-greencity-light/10 dark:bg-greencity-dark/20 p-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="entries" className="data-[state=active]:bg-greencity-primary data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                我的种植日记
              </TabsTrigger>
              <TabsTrigger value="new" className="data-[state=active]:bg-greencity-primary data-[state=active]:text-white">
                <Plus className="h-4 w-4 mr-2" />
                创建新日记
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="entries" className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-4">
                {diaryEntries.length > 0 ? (
                  diaryEntries.map((entry) => (
                    <Card key={entry.id} className="diary-card">
                      <div className="flex flex-col md:flex-row gap-4">
                        {entry.imageUrl && (
                          <div className="md:w-1/3">
                            <img
                              src={entry.imageUrl}
                              alt={entry.plantName}
                              className="rounded-md w-full h-48 object-cover"
                            />
                          </div>
                        )}
                        <div className="md:w-2/3 space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold">{entry.plantName}</h3>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(entry.date)}
                            </span>
                          </div>
                          
                          <div className="inline-block px-2 py-1 bg-greencity-primary/10 text-greencity-primary text-sm rounded-full">
                            {entry.stage}
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300">{entry.content}</p>
                          
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <Thermometer className="h-4 w-4 mr-1 text-greencity-primary" />
                              <span>{entry.temperature}°C</span>
                            </div>
                            <div className="flex items-center">
                              <Droplet className="h-4 w-4 mr-1 text-greencity-primary" />
                              <span>{entry.humidity}%</span>
                            </div>
                            <div className="flex items-center">
                              <Sun className="h-4 w-4 mr-1 text-greencity-primary" />
                              <span>{entry.light}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              编辑
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p>还没有种植日记，开始记录您的种植旅程吧！</p>
                    <Button
                      onClick={() => setActiveTab("new")}
                      className="mt-4 bg-greencity-primary hover:bg-greencity-dark"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      创建第一篇日记
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="new" className="p-6 space-y-4">
            <h3 className="text-xl font-bold">创建新日记</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">植物名称</label>
                <Input
                  placeholder="例如：小白菜、生菜、西红柿"
                  value={newEntry.plantName}
                  onChange={(e) => setNewEntry({...newEntry, plantName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">生长阶段</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newEntry.stage}
                  onChange={(e) => setNewEntry({...newEntry, stage: e.target.value})}
                >
                  <option value="" disabled>选择生长阶段</option>
                  <option value="播种期">播种期</option>
                  <option value="苗期">苗期</option>
                  <option value="生长期">生长期</option>
                  <option value="收获期">收获期</option>
                </select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium">日记内容</label>
                <Textarea
                  placeholder="记录今天的种植情况、观察和感想..."
                  rows={6}
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                  className="resize-none"
                />
              </div>
              
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-2">添加图片</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="mx-auto flex flex-col items-center">
                    <Camera className="h-12 w-12 text-gray-400 mb-4" />
                    <Button variant="outline" className="mb-2">
                      <Image className="h-4 w-4 mr-2" />
                      从相册选择
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">支持 JPG, PNG 格式，最大5MB</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium flex items-center">
                  <Thermometer className="h-4 w-4 mr-1" />
                  温度 ({newEntry.temperature}°C)
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={newEntry.temperature}
                  onChange={(e) => setNewEntry({...newEntry, temperature: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium flex items-center">
                  <Droplet className="h-4 w-4 mr-1" />
                  湿度 ({newEntry.humidity}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newEntry.humidity}
                  onChange={(e) => setNewEntry({...newEntry, humidity: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium flex items-center">
                  <Sun className="h-4 w-4 mr-1" />
                  光照强度
                </label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newEntry.light}
                  onChange={(e) => setNewEntry({...newEntry, light: e.target.value})}
                >
                  <option value="弱">弱 (遮阴/阴天)</option>
                  <option value="中等">中等 (明亮散射光)</option>
                  <option value="强">强 (直射阳光)</option>
                </select>
              </div>
            </div>
            
            {newEntry.stage && plantStageGuide[newEntry.stage as keyof typeof plantStageGuide] && (
              <Card className="p-3 mt-4 bg-greencity-primary/10">
                <h4 className="font-bold mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {newEntry.stage}阶段指南
                </h4>
                <ul className="list-disc pl-5 text-sm">
                  {plantStageGuide[newEntry.stage as keyof typeof plantStageGuide].tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
                <p className="text-sm mt-2">
                  <span className="font-medium">预计持续时间:</span> {plantStageGuide[newEntry.stage as keyof typeof plantStageGuide].duration}
                </p>
              </Card>
            )}
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" onClick={() => setActiveTab("entries")}>
                取消
              </Button>
              <Button 
                onClick={handleCreateEntry}
                disabled={!newEntry.plantName || !newEntry.stage || !newEntry.content}
                className="bg-greencity-primary hover:bg-greencity-dark"
              >
                保存日记
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default PlantingDiary;

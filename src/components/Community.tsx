
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, MapPin, Heart, MessageCircle, Share2, Search, 
  Award, ThumbsUp, Filter, Clock, Leaf, Plant
} from "lucide-react";

// Mock community posts - would come from an API in a real app
const mockPosts = [
  {
    id: 1,
    author: {
      name: "园艺小达人",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=garden1",
      level: 5,
    },
    content: "我家阳台上的小白菜今天收获了！从播种到今天正好40天，产量比预期的要好很多。分享一下我的种植经验：保持足够的阳光，控制好水分，间苗一定要及时。大家有什么问题可以随时问我！",
    images: ["https://p.lovethee.cn/uploads/allimg/190711/211I00I7-0.jpg"],
    location: "北京市海淀区",
    plantType: "小白菜",
    stage: "收获期",
    createdAt: "2024-04-03T10:30:00",
    likes: 42,
    comments: 8,
    isCertified: true
  },
  {
    id: 2,
    author: {
      name: "城市农夫",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=garden2",
      level: 3,
    },
    content: "请问有人知道我的番茄叶子为什么会卷曲吗？是温度问题还是水分问题？或者是缺少什么营养元素？附上照片，希望有经验的朋友能帮忙看看。",
    images: ["https://img.freepik.com/free-photo/cherry-tomatoes_74190-2529.jpg"],
    location: "上海市浦东新区",
    plantType: "樱桃番茄",
    stage: "生长期",
    createdAt: "2024-04-02T16:45:00",
    likes: 15,
    comments: 23,
    isQuestion: true
  },
  {
    id: 3,
    author: {
      name: "都市花草师",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=garden3",
      level: 4,
    },
    content: "今天参加了社区举办的都市农耕交流会，认识了很多志同道合的朋友，也学到了很多种植技巧。最让我惊讶的是有人在不到10平方米的阳台上种出了超过15种蔬菜！分享一些活动照片，希望能激励更多人加入城市种植的行列。",
    images: ["https://img.freepik.com/free-photo/top-view-vegetables-paper-bag_23-2148896864.jpg"],
    location: "广州市天河区",
    plantType: "多种蔬菜",
    stage: "多个阶段",
    createdAt: "2024-04-01T09:15:00",
    likes: 87,
    comments: 12,
    isEvent: true
  }
];

// Format time relative to now
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) {
    return "刚刚";
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟前`;
  } else if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}小时前`;
  } else {
    return `${Math.floor(seconds / 86400)}天前`;
  }
};

const Community = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState(mockPosts);
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  const handleLike = (postId: number) => {
    const isLiked = liked[postId];
    
    // Update liked state
    setLiked({
      ...liked,
      [postId]: !isLiked
    });
    
    // Update post likes count
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Users className="h-6 w-6 mr-2" />
            城市种植社区
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              筛选
            </Button>
            <Button className="bg-greencity-primary hover:bg-greencity-dark">
              发布内容
            </Button>
          </div>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索帖子、用户或植物..."
            className="pl-10"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-greencity-primary data-[state=active]:text-white">
              全部
            </TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-greencity-primary data-[state=active]:text-white">
              问答
            </TabsTrigger>
            <TabsTrigger value="experiences" className="data-[state=active]:bg-greencity-primary data-[state=active]:text-white">
              经验分享
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-greencity-primary data-[state=active]:text-white">
              活动
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              {posts.map((post) => (
                <Card key={post.id} className="community-post mb-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="font-semibold mr-2">{post.author.name}</div>
                          <div className="flex items-center text-xs bg-greencity-primary/10 text-greencity-primary px-2 py-1 rounded-full">
                            <Leaf className="h-3 w-3 mr-1" />
                            Lv.{post.author.level}
                          </div>
                          {post.isCertified && (
                            <div className="ml-2 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full flex items-center">
                              <Award className="h-3 w-3 mr-1" />
                              认证园艺师
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatRelativeTime(post.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 my-1">
                        <div className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full flex items-center">
                          <Plant className="h-3 w-3 mr-1" />
                          {post.plantType}
                        </div>
                        <div className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {post.location}
                        </div>
                        {post.stage && (
                          <div className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            {post.stage}
                          </div>
                        )}
                        {post.isQuestion && (
                          <div className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-2 py-1 rounded-full">
                            求助
                          </div>
                        )}
                        {post.isEvent && (
                          <div className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded-full">
                            活动
                          </div>
                        )}
                      </div>
                      
                      <p className="my-2 text-gray-800 dark:text-gray-200">{post.content}</p>
                      
                      {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-1 gap-2 mb-3">
                          {post.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${post.author.name}的图片`}
                              className="rounded-lg w-full h-48 object-cover"
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={`${liked[post.id] ? 'text-red-500' : ''}`}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${liked[post.id] ? 'fill-current' : ''}`} />
                          {post.likes + (liked[post.id] ? 1 : 0)}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          分享
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="questions">
            <div className="py-12 text-center">
              <div className="mb-4 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-2" />
                <p>当前筛选条件下没有显示内容</p>
              </div>
              <Button>浏览所有内容</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="experiences">
            <div className="py-12 text-center">
              <div className="mb-4 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-2" />
                <p>当前筛选条件下没有显示内容</p>
              </div>
              <Button>浏览所有内容</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="events">
            <div className="py-12 text-center">
              <div className="mb-4 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-2" />
                <p>当前筛选条件下没有显示内容</p>
              </div>
              <Button>浏览所有内容</Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-bold mb-3 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          推荐种植达人
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex flex-col items-center p-3 border rounded-lg hover:border-greencity-primary/50 transition-colors">
              <Avatar className="h-16 w-16 mb-2">
                <AvatarImage src={`https://api.dicebear.com/7.x/thumbs/svg?seed=expert${num}`} />
                <AvatarFallback>专家</AvatarFallback>
              </Avatar>
              <div className="font-semibold text-center">园艺专家 {num}</div>
              <div className="flex items-center text-xs bg-greencity-primary/10 text-greencity-primary px-2 py-1 rounded-full my-1">
                <Leaf className="h-3 w-3 mr-1" />
                Lv.{5 + num}
              </div>
              <div className="text-xs text-gray-500 mb-2 flex items-center">
                <ThumbsUp className="h-3 w-3 mr-1" />
                {120 + num * 30}人受益
              </div>
              <Button variant="outline" size="sm" className="w-full">
                关注
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Community;


import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SolarTermWeather from "@/components/SolarTermWeather";
import PlantingGuide from "@/components/PlantingGuide";
import { Calendar, FileText, Users, MapPin, ChevronRight, Leaf, Award, Sprout, SunMedium } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-greencity-primary to-greencity-dark opacity-90 z-0"></div>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?q=80&w=2070')",
              filter: "brightness(0.4)"
            }}
          ></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
            <div className="text-center md:text-left md:max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
                城市种植，<br />从此变得简单
              </h1>
              <p className="text-xl text-white/90 mb-8">
                基于中国二十四节气的智能种植指导，<br />让每个人都能在城市中享受种植的乐趣
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                <Button className="bg-white text-greencity-primary hover:bg-gray-100 text-lg px-6 py-6">
                  开始种植
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-6 py-6">
                  了解更多
                </Button>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-greencity-dark/90 to-transparent z-10"></div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">GreenCity 为您提供</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                全方位的城市种植解决方案，让您即使在寸土寸金的城市，也能轻松拥有自己的绿色菜园。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-full bg-greencity-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-greencity-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">节气天气预报</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    基于中国传统二十四节气的智能天气预报，为您的种植提供精准的气象参考。
                  </p>
                  <Link to="/weather" className="text-greencity-primary hover:underline flex items-center">
                    查看详情
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-full bg-greencity-primary/10 flex items-center justify-center mb-4">
                    <Sprout className="h-8 w-8 text-greencity-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">智能种植指南</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    根据您的地理位置、种植环境和光照条件，智能推荐最适合您种植的植物和种植方案。
                  </p>
                  <Link to="/guide" className="text-greencity-primary hover:underline flex items-center">
                    开始规划
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-full bg-greencity-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-greencity-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">种植日记系统</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    记录您的种植过程，获取针对不同生长阶段的专业建议，积累宝贵的种植经验。
                  </p>
                  <Link to="/diary" className="text-greencity-primary hover:underline flex items-center">
                    开始记录
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-full bg-greencity-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-greencity-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">社区互动</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    加入志同道合的城市种植者社区，分享经验，解答疑问，共同成长。
                  </p>
                  <Link to="/community" className="text-greencity-primary hover:underline flex items-center">
                    加入社区
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-full bg-greencity-primary/10 flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-greencity-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">地理位置服务</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    基于您的地理位置提供本地化的种植建议，匹配适合您所在气候区的植物品种。
                  </p>
                  <a href="#" className="text-greencity-primary hover:underline flex items-center">
                    设置位置
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="h-14 w-14 rounded-full bg-greencity-primary/10 flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-greencity-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">专家咨询</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    连接专业的园艺专家，获取种植疑难问题的解答和定制化的种植建议。
                  </p>
                  <a href="#" className="text-greencity-primary hover:underline flex items-center">
                    咨询专家
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Weather Preview Section */}
        <section className="py-12 bg-greencity-light/10 dark:bg-greencity-dark/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">当前节气天气</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                基于二十四节气的精准天气预报，为您的种植提供更符合中国传统农业智慧的参考。
              </p>
            </div>
            
            <SolarTermWeather />
            
            <div className="text-center mt-8">
              <Link to="/weather">
                <Button variant="outline" className="gap-2">
                  <SunMedium className="h-4 w-4" />
                  查看完整天气报告
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Quick Start Guide */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">快速开始您的种植之旅</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                填写以下信息，获取专属于您的智能种植方案，开启城市种植新生活。
              </p>
            </div>
            
            <PlantingGuide />
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="relative py-16 md:py-24">
          <div className="absolute inset-0 bg-greencity-dark opacity-90 z-0"></div>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=2070')",
              filter: "brightness(0.3)"
            }}
          ></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <Leaf className="h-16 w-16 text-white mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                加入 GreenCity 城市种植社区
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                与超过10万名城市种植爱好者一起交流经验，分享收获，共同成长。
              </p>
              <Button className="bg-white text-greencity-primary hover:bg-gray-100 text-lg px-8 py-6">
                立即注册
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;


import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Community from "@/components/Community";

const CommunityPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">种植社区</h1>
            <p className="text-gray-600 dark:text-gray-400">
              加入志同道合的城市种植者社区，分享经验，解答疑问，共同成长。
            </p>
          </div>
          
          <Community />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CommunityPage;

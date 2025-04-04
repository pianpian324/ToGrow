
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlantingDiary from "@/components/PlantingDiary";

const Diary = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">种植日记</h1>
            <p className="text-gray-600 dark:text-gray-400">
              记录您的种植过程，获取专业建议，积累宝贵的种植经验。
            </p>
          </div>
          
          <PlantingDiary />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Diary;

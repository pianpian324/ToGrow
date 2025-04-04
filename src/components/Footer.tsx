
import { Link } from "react-router-dom";
import { Leaf, Mail, Github, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-greencity-dark border-t border-greencity-light/30 dark:border-greencity-dark/50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-greencity-primary" />
              <span className="font-bold text-xl text-greencity-primary">GreenCity</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              面向城市人群的智能种植应用，让城市生活更绿色、更健康。
            </p>
            <div className="flex space-x-4">
              <a href="mailto:contact@greencity.com" className="text-gray-400 hover:text-greencity-primary">
                <Mail className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-greencity-primary">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-greencity-primary">功能</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/weather" className="text-gray-600 dark:text-gray-400 hover:text-greencity-primary">
                  节气天气预报
                </Link>
              </li>
              <li>
                <Link to="/guide" className="text-gray-600 dark:text-gray-400 hover:text-greencity-primary">
                  智能种植指南
                </Link>
              </li>
              <li>
                <Link to="/diary" className="text-gray-600 dark:text-gray-400 hover:text-greencity-primary">
                  种植日记系统
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-600 dark:text-gray-400 hover:text-greencity-primary">
                  社区互动
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-greencity-primary">资源</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-greencity-primary flex items-center">
                  种植百科
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-greencity-primary flex items-center">
                  常见问题
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-greencity-primary flex items-center">
                  种植技巧
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-greencity-primary flex items-center">
                  API文档
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-greencity-primary">关于我们</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-greencity-primary">
                  关于GreenCity
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-greencity-primary">
                  使用条款
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-greencity-primary">
                  隐私政策
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-greencity-primary">
                  联系我们
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} GreenCity. 保留所有权利。
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

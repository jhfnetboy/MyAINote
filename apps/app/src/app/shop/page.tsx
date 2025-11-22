"use client";
import { RoundedButton } from "@/components/RoundedButton";
import { useCallback } from "react";

export default function ShopPage() {
  // 模拟购买功能
  const handleBuy = useCallback((id: number): void => {
    console.log(`Buy item with id: ${id}`);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">社区商店</h1>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-1">您的积分余额</h2>
            <p className="text-3xl font-bold">1,250</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">已兑换商品</p>
            <p className="text-xl font-semibold">3 件</p>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">热门商品</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopItems.slice(0, 3).map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">{item.emoji}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{item.description}</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-blue-600">{item.points} 积分</p>
                  <RoundedButton 
                    onClick={() => handleBuy(item.id)} 
                    title="兑换" 
                    disabled={false} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">所有商品</h2>
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm">全部</button>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">数字藏品</button>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">实物商品</button>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">会员权益</button>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">优惠券</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shopItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-2xl">
                  {item.emoji}
                </div>
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <p className="font-semibold text-blue-600">{item.points} 积分</p>
                <button className="text-sm text-blue-600 hover:underline">
                  详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">兑换规则</h2>
        <div className="prose dark:prose-invert max-w-none text-sm">
          <ul>
            <li>兑换后的数字藏品将在24小时内发放到您的账户</li>
            <li>实物商品将在7个工作日内发出，请确保您的收货地址正确</li>
            <li>会员权益在兑换后即刻生效</li>
            <li>所有兑换均不可撤销，请谨慎选择</li>
            <li>如有问题请联系社区管理员</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 模拟数据
const shopItems = [
  {
    id: 1,
    name: "限定NFT头像",
    description: "社区限定版头像，彰显您的资深会员身份",
    points: 500,
    category: "数字藏品",
    emoji: "🖼️",
  },
  {
    id: 2,
    name: "社区周边T恤",
    description: "精选面料定制款T恤，展示您的社区归属感",
    points: 800,
    category: "实物商品",
    emoji: "👕",
  },
  {
    id: 3,
    name: "VIP会员资格",
    description: "一个月VIP会员资格，享受专属活动邀请和权益",
    points: 1000,
    category: "会员权益",
    emoji: "👑",
  },
  {
    id: 4,
    name: "定制贴纸套装",
    description: "社区吉祥物贴纸套装，包含10款不同设计",
    points: 300,
    category: "实物商品",
    emoji: "🏷️",
  },
  {
    id: 5,
    name: "社区专属勋章",
    description: "可在个人资料展示的成就勋章，证明您的贡献",
    points: 400,
    category: "数字藏品",
    emoji: "🏅",
  },
  {
    id: 6,
    name: "优先回复权",
    description: "您的问题将获得社区专家优先回复",
    points: 200,
    category: "会员权益",
    emoji: "💬",
  },
  {
    id: 7,
    name: "电子书优惠券",
    description: "可兑换一本精选电子书的优惠券",
    points: 150,
    category: "优惠券",
    emoji: "📚",
  },
  {
    id: 8,
    name: "抽奖券",
    description: "参与月度大奖抽奖的资格券",
    points: 100,
    category: "优惠券",
    emoji: "🎟️",
  },
]; 
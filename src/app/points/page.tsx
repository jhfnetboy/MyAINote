"use client";
import { RoundedButton } from "@/components/RoundedButton";
import { useCallback } from "react";

export default function PointsPage() {
  // 模拟兑换功能
  const handleExchange = useCallback((): void => {
    console.log("Exchange points clicked");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">OpenPoints 社区积分</h1>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">您的积分余额</h2>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-3xl font-bold mb-1">1,250</p>
            <p className="text-sm text-gray-500">可用积分</p>
          </div>
          <RoundedButton 
            onClick={handleExchange} 
            title="兑换商品/服务" 
            disabled={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">积分记录</h2>
          <div className="border rounded-lg divide-y">
            {pointsHistory.map((record, index) => (
              <div key={index} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{record.description}</p>
                    <p className="text-sm text-gray-500">{record.date}</p>
                  </div>
                  <p className={`font-semibold ${record.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {record.amount > 0 ? '+' : ''}{record.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">积分获取方式</h2>
          <div className="space-y-4">
            {earnMethods.map((method, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-300">{method.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{method.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">社区积分规则</h2>
        <div className="prose dark:prose-invert max-w-none">
          <ul>
            <li>积分可通过完成任务、参与活动等方式获取</li>
            <li>积分可用于兑换社区内的商品、服务和福利</li>
            <li>积分有效期为获取之日起12个月</li>
            <li>社区保留对积分规则进行修改和解释的权利</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 模拟数据
const pointsHistory = [
  { description: "完成每日签到", amount: 10, date: "今天" },
  { description: "参与社区讨论", amount: 50, date: "昨天" },
  { description: "推荐新用户", amount: 100, date: "3天前" },
  { description: "兑换NFT头像", amount: -200, date: "上周" },
  { description: "完成任务：发布原创内容", amount: 150, date: "上周" },
];

const earnMethods = [
  {
    icon: "✅",
    title: "完成任务",
    description: "每完成一个社区任务可获取10-200不等的积分奖励"
  },
  {
    icon: "📅",
    title: "每日签到",
    description: "连续签到可获得递增的积分奖励，最高每天20积分"
  },
  {
    icon: "👥",
    title: "推荐好友",
    description: "每成功邀请一位新用户加入社区可获得100积分"
  },
  {
    icon: "📝",
    title: "发布内容",
    description: "发布原创内容并获得点赞可获得相应积分"
  }
]; 
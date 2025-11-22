"use client";
import { RoundedButton } from "@/components/RoundedButton";
import { useCallback } from "react";

export default function ReputationPage() {
  // 模拟领取SBT函数
  const handleClaimSBT = useCallback((): void => {
    console.log("Claim SBT clicked");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">社区声誉系统</h1>
      
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">您的声誉等级</h2>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                Lv.3
              </div>
              <div className="ml-4">
                <p className="font-semibold">高级贡献者</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
                <p className="text-xs mt-1">距离下一等级：75/100</p>
              </div>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm mb-2">符合领取SBT条件</p>
            <RoundedButton 
              onClick={handleClaimSBT}
              title="领取SBT勋章" 
              disabled={false}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">您的声誉成就</h2>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="border rounded-lg p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${achievement.completed ? 'bg-green-600' : 'bg-gray-400'}`}>
                  {achievement.completed ? '✓' : '○'}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${achievement.completed ? 'text-green-600' : 'text-gray-500'}`}>
                    {achievement.completed ? '已完成' : `${achievement.progress}/${achievement.total}`}
                  </p>
                  <p className="text-sm text-gray-500">+{achievement.points}分</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">社区声誉排行</h2>
          <div className="overflow-hidden border rounded-lg">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    排名
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    等级
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    声誉分
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y">
                {leaderboard.map((user, index) => (
                  <tr key={index} className={index === 2 ? 'bg-purple-50 dark:bg-purple-900/20' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {index < 3 ? 
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            index === 0 ? 'bg-yellow-400' : 
                            index === 1 ? 'bg-gray-300' : 
                            'bg-amber-600'
                          } text-white`}>{index + 1}</span> :
                          <span>{index + 1}</span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium">
                          {user.name}
                          {index === 2 && <span className="ml-2 text-xs text-purple-600">(您)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">Lv.{user.level}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">声誉等级说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">如何获取声誉？</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>完成社区任务</li>
              <li>发布高质量内容并获得点赞</li>
              <li>参与社区治理投票</li>
              <li>帮助其他社区成员</li>
              <li>长期活跃参与社区活动</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">声誉等级特权</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><span className="font-medium">Lv.1 新手</span>: 基础访问权限</li>
              <li><span className="font-medium">Lv.2 活跃成员</span>: 专属讨论区访问权</li>
              <li><span className="font-medium">Lv.3 高级贡献者</span>: 专属SBT，投票权重1.5倍</li>
              <li><span className="font-medium">Lv.4 资深专家</span>: 免费领取限定NFT，投票权重2倍</li>
              <li><span className="font-medium">Lv.5 社区领袖</span>: 参与核心决策，提案特权</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// 模拟数据
const achievements = [
  {
    name: "社区新星",
    description: "完成新用户任务",
    points: 10,
    completed: true,
    progress: 1,
    total: 1
  },
  {
    name: "内容创作者",
    description: "发布5篇原创内容",
    points: 50,
    completed: false,
    progress: 3,
    total: 5
  },
  {
    name: "社区贡献者",
    description: "参与10次社区讨论",
    points: 30,
    completed: true,
    progress: 10,
    total: 10
  },
  {
    name: "积极投票",
    description: "参与20次社区治理投票",
    points: 40,
    completed: false,
    progress: 15,
    total: 20
  },
  {
    name: "任务达人",
    description: "完成50个社区任务",
    points: 100,
    completed: false,
    progress: 32,
    total: 50
  }
];

const leaderboard = [
  { name: "CryptoWhale", level: 5, points: 1250 },
  { name: "BlockchainGuru", level: 5, points: 1120 },
  { name: "User123", level: 3, points: 780 },
  { name: "Satoshi2022", level: 4, points: 650 },
  { name: "EthFan", level: 3, points: 520 },
  { name: "Web3Explorer", level: 2, points: 410 },
  { name: "TokenMaster", level: 2, points: 350 },
  { name: "CryptoNewbie", level: 1, points: 120 }
]; 
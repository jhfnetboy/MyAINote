"use client";
import { RoundedButton } from "@/components/RoundedButton";
import { useCallback, useState } from "react";

interface Task {
  id: number;
  title: string;
  description: string;
  reward: {
    points: number;
    reputation?: number;
  };
  difficulty: "easy" | "medium" | "hard";
  status: "available" | "in_progress" | "completed";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const startTask = useCallback((taskId: number): void => {
    // 在实际应用中，这里会调用 Tauri API 开始任务
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: "in_progress" as const } : task
    ));
  }, [tasks]);

  const completeTask = useCallback((taskId: number): void => {
    // 在实际应用中，这里会调用 Tauri API 完成任务并验证
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: "completed" as const } : task
    ));
  }, [tasks]);

  const getDifficultyBadge = (difficulty: Task["difficulty"]) => {
    const classes = {
      easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${classes[difficulty]}`}>
        {difficulty === "easy" ? "简单" : difficulty === "medium" ? "中等" : "困难"}
      </span>
    );
  };

  const getStatusBadge = (status: Task["status"]) => {
    const classes = {
      available: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    };
    
    const statusText = {
      available: "可领取",
      in_progress: "进行中",
      completed: "已完成"
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${classes[status]}`}>
        {statusText[status]}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">社区任务</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          完成任务获得积分和 reputation，提升你在社区中的地位
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">您的统计</h2>
            <p className="text-gray-600 dark:text-gray-400">已完成 {tasks.filter(t => t.status === "completed").length} 个任务</p>
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold">1250</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">积分余额</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">75</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reputation</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <div key={task.id} className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
              <h3 className="font-semibold">{task.title}</h3>
              {getDifficultyBadge(task.difficulty)}
            </div>
            <div className="p-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">{task.description}</p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="font-medium">奖励</div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-sm">{task.reward.points} 积分</span>
                    {task.reward.reputation && (
                      <span className="text-sm">+{task.reward.reputation} Rep</span>
                    )}
                  </div>
                </div>
                {getStatusBadge(task.status)}
              </div>
              {task.status === "available" && (
                <RoundedButton onClick={() => { startTask(task.id); }} title="领取任务" />
              )}
              {task.status === "in_progress" && (
                <RoundedButton onClick={() => { completeTask(task.id); }} title="提交完成" />
              )}
              {task.status === "completed" && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  任务已完成，感谢您的贡献！
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 模拟任务数据
const mockTasks: Task[] = [
  {
    id: 1,
    title: "完成社区注册",
    description: "注册账号并完成个人信息填写",
    reward: { points: 100 },
    difficulty: "easy",
    status: "completed"
  },
  {
    id: 2,
    title: "邀请新用户",
    description: "邀请一名新用户加入社区，新用户需完成注册",
    reward: { points: 150, reputation: 5 },
    difficulty: "easy",
    status: "available"
  },
  {
    id: 3,
    title: "发布内容分享",
    description: "在社区发布一篇原创内容，分享您的经验或见解",
    reward: { points: 200, reputation: 10 },
    difficulty: "medium",
    status: "available"
  },
  {
    id: 4,
    title: "参与社区投票",
    description: "参与社区治理提案的投票",
    reward: { points: 50, reputation: 3 },
    difficulty: "easy",
    status: "available"
  },
  {
    id: 5,
    title: "贡献代码",
    description: "为社区项目提交代码，修复bug或添加新功能",
    reward: { points: 500, reputation: 25 },
    difficulty: "hard",
    status: "in_progress"
  },
  {
    id: 6,
    title: "组织社区活动",
    description: "组织线上或线下社区活动，至少有10人参与",
    reward: { points: 300, reputation: 15 },
    difficulty: "medium",
    status: "available"
  }
]; 
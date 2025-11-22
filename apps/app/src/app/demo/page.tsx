"use client";
import { RoundedButton } from "@/components/RoundedButton";
import { invoke } from "@tauri-apps/api/core";
import { listen, once } from "@tauri-apps/api/event";
import { useCallback, useEffect, useState } from "react";

interface CalculationResult {
  result: number;
  timestamp: number;
  description: string;
}

interface ProcessStatus {
  id: number;
  memory_usage: number;
  cpu_usage: number;
  timestamp: number;
}

interface HardwareInfo {
  cpu: string;
  memory_total: number;
  memory_free: number;
  operating_system: string;
  hostname: string;
  cores: number;
}

export default function DemoPage() {
  // 简单命令调用状态
  const [greeted, setGreeted] = useState<string | null>(null);
  
  // 参数化命令调用状态
  const [firstNumber, setFirstNumber] = useState<number>(0);
  const [secondNumber, setSecondNumber] = useState<number>(0);
  const [operation, setOperation] = useState<string>("add");
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 事件系统状态
  const [processStatuses, setProcessStatuses] = useState<ProcessStatus[]>([]);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  
  // 硬件信息状态
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [hardwareLoading, setHardwareLoading] = useState<boolean>(false);

  // 简单命令调用
  const greet = useCallback((): void => {
    invoke<string>("greet")
      .then((s) => {
        setGreeted(s);
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }, []);

  // 参数化命令调用
  const performCalculation = useCallback((): void => {
    setError(null);
    invoke<CalculationResult>("calculate", {
      a: firstNumber,
      b: secondNumber,
      operation: operation,
    })
      .then((result) => {
        setCalculationResult(result);
      })
      .catch((err: unknown) => {
        if (typeof err === "string") {
          setError(err);
        } else {
          setError("An unknown error occurred");
        }
        console.error(err);
      });
  }, [firstNumber, secondNumber, operation]);
  
  // 事件系统
  const startMonitoring = useCallback((): void => {
    // 重置状态
    setProcessStatuses([]);
    setIsMonitoring(true);
    
    // 调用Rust命令开始后台监控
    invoke("start_process_monitoring")
      .catch((err: unknown) => {
        console.error("Failed to start monitoring:", err);
        setIsMonitoring(false);
      });
  }, []);
  
  // 获取硬件信息
  const fetchHardwareInfo = useCallback((): void => {
    setHardwareLoading(true);
    invoke<HardwareInfo>("get_hardware_info")
      .then((info) => {
        setHardwareInfo(info);
      })
      .catch((err: unknown) => {
        console.error("Failed to get hardware info:", err);
      })
      .finally(() => {
        setHardwareLoading(false);
      });
  }, []);
  
  // 设置事件监听器
  useEffect(() => {
    // 清除之前的状态
    setProcessStatuses([]);
    
    const unlisten = listen<ProcessStatus>("process-status", (event) => {
      setProcessStatuses((current) => {
        const newStatuses = [...current, event.payload];
        // 只保留最近的5个状态
        if (newStatuses.length > 5) {
          return newStatuses.slice(newStatuses.length - 5);
        }
        return newStatuses;
      });
    });
    
    // 当事件接收到10次后，监听完成
    once("window-process-status", () => {
      // 这只是一个演示，实际上我们会在接收到某个特定事件时停止监控
      console.log("Received window-specific event");
    });
    
    return () => {
      // 在组件卸载时取消监听
      unlisten.then(unlistenFn => unlistenFn());
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tauri 前后端通信演示</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 简单命令调用 */}
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">1. 简单命令调用</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            调用Rust函数返回一个简单字符串，无需传递参数。
          </p>
          <div className="mb-4">
            <RoundedButton onClick={greet} title="调用 greet" disabled={false} />
          </div>
          {greeted && (
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
              <p><strong>返回结果:</strong></p>
              <p className="font-mono text-sm">{greeted}</p>
            </div>
          )}
        </div>
        
        {/* 参数化命令调用 */}
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">2. 参数化命令调用</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            传递参数给Rust函数并接收结构化返回数据。
          </p>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block mb-1">第一个数:</label>
              <input
                type="number"
                value={firstNumber}
                onChange={(e) => setFirstNumber(parseInt(e.target.value || "0", 10))}
                className="border rounded p-2 w-full dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block mb-1">第二个数:</label>
              <input
                type="number"
                value={secondNumber}
                onChange={(e) => setSecondNumber(parseInt(e.target.value || "0", 10))}
                className="border rounded p-2 w-full dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block mb-1">操作:</label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="border rounded p-2 w-full dark:bg-gray-800"
              >
                <option value="add">加法 (+)</option>
                <option value="subtract">减法 (-)</option>
                <option value="multiply">乘法 (*)</option>
                <option value="divide">除法 (/)</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <RoundedButton onClick={performCalculation} title="计算" disabled={false} />
          </div>
          {error && (
            <div className="p-3 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded mb-3">
              <p><strong>错误:</strong> {error}</p>
            </div>
          )}
          {calculationResult && (
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
              <p><strong>结果:</strong> {calculationResult.result}</p>
              <p><strong>描述:</strong> {calculationResult.description}</p>
              <p className="text-xs text-gray-500">
                时间戳: {new Date(calculationResult.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        
        {/* 事件系统 */}
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">3. 事件系统</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            从Rust后台任务接收实时更新。
          </p>
          <div className="mb-4">
            <RoundedButton 
              onClick={startMonitoring} 
              title={isMonitoring ? "监控中..." : "开始监控"} 
              disabled={isMonitoring} 
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">进程状态更新:</h3>
            {processStatuses.length === 0 ? (
              <p className="text-gray-500">尚无数据，点击"开始监控"接收更新。</p>
            ) : (
              <div className="space-y-2">
                {processStatuses.map((status) => (
                  <div key={status.id} className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                    <div className="flex justify-between">
                      <span>ID: {status.id}</span>
                      <span>内存: {status.memory_usage} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CPU: {(status.cpu_usage * 100).toFixed(1)}%</span>
                      <span className="text-xs text-gray-500">
                        {new Date(status.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* 硬件信息 */}
        <div className="border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">4. 硬件信息检测</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            使用Rust获取系统硬件配置信息。
          </p>
          <div className="mb-4">
            <RoundedButton 
              onClick={fetchHardwareInfo} 
              title={hardwareLoading ? "加载中..." : "获取硬件信息"} 
              disabled={hardwareLoading} 
            />
          </div>
          {hardwareInfo && (
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
              <div className="space-y-2">
                <p><strong>CPU:</strong> {hardwareInfo.cpu}</p>
                <p><strong>CPU核心数:</strong> {hardwareInfo.cores}</p>
                <p><strong>总内存:</strong> {hardwareInfo.memory_total} MB</p>
                <p><strong>可用内存:</strong> {hardwareInfo.memory_free} MB</p>
                <p><strong>操作系统:</strong> {hardwareInfo.operating_system}</p>
                <p><strong>主机名:</strong> {hardwareInfo.hostname}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          此演示展示了Tauri应用中三种主要的前后端通信方式，以及如何使用Rust获取系统信息。
        </p>
      </div>
    </div>
  );
} 
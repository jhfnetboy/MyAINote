"use client";
import { RoundedButton } from "@/components/RoundedButton";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    walletAddress: "",
    acceptTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const nextStep = useCallback((): void => {
    setStep(step + 1);
  }, [step]);

  const prevStep = useCallback((): void => {
    setStep(step - 1);
  }, [step]);

  const handleSubmit = useCallback((): void => {
    // 这里应该调用 Tauri 注册 API
    console.log("表单提交数据:", formData);
    setStep(4); // 转到成功页面
  }, [formData]);

  const goToTasks = useCallback((): void => {
    router.push("/tasks");
  }, [router]);

  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6">欢迎加入 COS72</h2>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
              完成注册后，您将获得 Gas Card，有 reputation 后可以领取 SBT。
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">用户名</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">电子邮箱</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>
            <RoundedButton onClick={nextStep} title="下一步" />
          </div>
        );
      case 2:
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6">连接钱包</h2>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
              连接您的钱包以便接收奖励和参与社区活动。
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">钱包地址</label>
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="0x..."
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <RoundedButton onClick={prevStep} title="上一步" />
              <RoundedButton onClick={nextStep} title="下一步" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6">确认信息</h2>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
              请确认以下信息是否正确。
            </p>
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="mb-2">
                <span className="font-medium">用户名:</span> {formData.name}
              </div>
              <div className="mb-2">
                <span className="font-medium">电子邮箱:</span> {formData.email}
              </div>
              <div>
                <span className="font-medium">钱包地址:</span> {formData.walletAddress}
              </div>
            </div>
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mr-2"
                  required
                />
                <span className="text-sm">我已阅读并同意服务条款和隐私政策</span>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <RoundedButton onClick={prevStep} title="上一步" />
              <RoundedButton
                onClick={handleSubmit}
                title="完成注册"
                disabled={!formData.acceptTerms}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-300 text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">注册成功!</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              恭喜！您已成功注册 COS72。<br />
              您已获得 1000 Gas Card 积分。<br />
              完成更多任务以获得 reputation 并解锁更多功能。
            </p>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md mb-8">
              <h3 className="font-semibold mb-2">您的 Gas Card</h3>
              <div className="text-2xl font-bold">1000 积分</div>
            </div>
            <div className="flex justify-center">
              <RoundedButton
                onClick={goToTasks}
                title="查看任务"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= item
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {item}
                </div>
                {item < 3 && (
                  <div
                    className={`h-1 w-16 ${
                      step > item
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm">个人信息</span>
            <span className="text-sm">连接钱包</span>
            <span className="text-sm">确认信息</span>
          </div>
        </div>

        {renderForm()}
      </div>
    </div>
  );
} 
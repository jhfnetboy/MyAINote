"use client";
import { RoundedButton } from "@/components/RoundedButton";
import Image from "next/image";
import { useCallback, useState } from "react";
import Link from "next/link";
import { invoke } from "@tauri-apps/api/core";

export default function Home() {
  const [aiResponse, setAiResponse] = useState("");

  const callAI = useCallback(async () => {
    try {
      const response = await invoke<string>("greet_with_ai", { name: "Jason" });
      setAiResponse(response);
    } catch (e) {
      console.error(e);
      setAiResponse("Error calling AI: " + String(e));
    }
  }, []);

  // Simulate login functionality
  const handleLogin = useCallback((): void => {
    // Here should call Tauri API for login authentication
    console.log("Login clicked");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="flex flex-col md:flex-row gap-8 items-center mb-16">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-4">Welcome to COS72 Community Tool</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            COS72 is a simple community tool that any product or business can use to build their own community with embedded common features.
            Through this platform, you can connect users, incentivize participation, and build loyalty.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <RoundedButton 
                onClick={handleLogin} 
                title="Login/Register" 
                disabled={false}
              />
              <RoundedButton 
                onClick={callAI} 
                title="Test Local AI" 
                disabled={false}
              />
            </div>
            {aiResponse && (
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-800">
                <p className="font-mono text-sm">{aiResponse}</p>
              </div>
            )}
            <Link href="/onboarding">
              <span className="m-4 max-w-xs rounded-xl border border-gray-200 p-6 text-left text-inherit transition-colors hover:border-blue-600 hover:text-blue-600 focus:border-blue-600 focus:text-blue-600 active:border-blue-600 active:text-blue-600 cursor-pointer rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44">
                Learn More
              </span>
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative w-full h-[300px] md:h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {/* Here you can place community tool diagrams or logos */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl font-bold text-gray-300 dark:text-gray-600">COS72</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="border p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 text-xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">How to Use</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ol className="list-decimal pl-6 space-y-4">
              <li className="text-lg">Clone and initialize configuration</li>
              <li className="text-lg">One-click deployment to web (GitHub Pages, Netlify, or others)</li>
              <li className="text-lg">Create community and start using</li>
              <li className="text-lg">Set up community basic information and contracts through admin interface</li>
              <li className="text-lg">Invite users to join and start interacting</li>
            </ol>
          </div>
          <div className="border p-6 rounded-lg bg-gray-50 dark:bg-gray-900">
            <h3 className="text-xl font-semibold mb-3">Recent Activities</h3>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border-b pb-2">
                  <p className="font-medium">{activity.action}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{activity.user}</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="max-w-2xl mx-auto mb-6">
          Join COS72, create your own community, incentivize user participation, and build a vibrant ecosystem.
        </p>
        <RoundedButton 
          onClick={handleLogin} 
          title="Get Started Now"
          disabled={false}
        />
      </section>
    </div>
  );
}

// Mock data
const features = [
  {
    icon: "🚀",
    title: "Onboarding",
    description: "Visible to new/non-logged users, get Gas Card after registration, claim SBT after having reputation"
  },
  {
    icon: "💰",
    title: "OpenPNTs/OpenCards",
    description: "Issue points and establish white cards, other communities with reputation can get point sponsorship"
  },
  {
    icon: "✅",
    title: "Tasks",
    description: "Contract interactions, complete tasks to earn points and reputation"
  },
  {
    icon: "🛒",
    title: "Shops",
    description: "Admins upload services and products, members exchange points for goods, services and coupons"
  },
  {
    icon: "🏆",
    title: "Reputation Rank",
    description: "Earn reputation by completing tasks, includes NFT and weighted points"
  },
  {
    icon: "🏠",
    title: "Homepage",
    description: "Points to single-page introduction, defaults to homepage, customizable background image"
  }
];

const activities = [
  {
    id: 1,
    user: "User123",
    action: "Completed 'Community Promotion' task",
    time: "2 hours ago"
  },
  {
    id: 2,
    user: "Community456",
    action: "Published new community rewards",
    time: "5 hours ago"
  },
  {
    id: 3,
    user: "Developer789",
    action: "Received 'Web3 Contributor' SBT",
    time: "1 day ago"
  },
  {
    id: 4,
    user: "Admin001",
    action: "Updated community rules",
    time: "2 days ago"
  }
];

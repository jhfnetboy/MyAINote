# AutoAINote
An AI auto note with saving on iCloud, cross platform: Mac, Windows, Linux, Android, iOS and Chrome Plugin.

## 使用
- 克隆后初始化配置，一键完成后网址部署（github pages或者netlify或者其他）
- 创建社区，开始使用

## Tauri + Next.js 集成解决方案

### 常见问题及解决方案

#### 1. Tauri API 调用错误

在 Tauri 2.0 中，一些 API 发生了变化：
- `emit_all` 方法改为 `emit` 方法
- 需要导入 `Emitter` trait 才能使用事件相关功能

解决方案：
```rust
// 添加必要的 trait 导入
use tauri::Emitter;

// 使用 emit 而非 emit_all
app_handle.emit("event-name", payload).unwrap();
```

#### 2. Rust 异步任务中的生命周期问题

在 Rust 异步任务中使用 Window 或 AppHandle 时，需要确保它们满足 `'static` 生命周期要求：

解决方案：
```rust
// 克隆 app_handle 以满足 'static 生命周期要求
let app_handle = window.app_handle().clone();
let window_label = window.label().to_string();

tauri::async_runtime::spawn(async move {
    // 现在可以在异步任务中安全使用 app_handle
});
```

#### 3. 在 Next.js 中使用 Tauri API 的 window/navigator not defined 错误

Next.js 在服务器端渲染过程中无法访问 `window` 或 `navigator` 对象，而 Tauri API 依赖于这些浏览器环境对象。

解决方案：
- 确保 Tauri 函数在客户端 React 组件中尽可能晚地导入
- 使用动态导入或 React 的 `useEffect` 钩子确保代码只在客户端执行
- 或使用 Next.js 的惰性加载功能

```jsx
"use client"; // 确保组件在客户端渲染

import { useEffect, useState } from "react";

function MyComponent() {
  const [tauriApi, setTauriApi] = useState(null);
  
  useEffect(() => {
    // 仅在客户端执行导入
    const loadTauriApi = async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      setTauriApi({ invoke });
    };
    
    loadTauriApi();
  }, []);
  
  // 使用 tauriApi
}
```

#### 4. React 组件的 TypeScript 属性错误

当扩展 React 组件功能时，需要确保更新相应的 TypeScript 接口定义。

示例错误：
```
Type '{ onClick: () => void; title: string; disabled: boolean; }' is not assignable to type 'IntrinsicAttributes & RoundedButtonProps'.
Property 'disabled' does not exist on type 'IntrinsicAttributes & RoundedButtonProps'.
```

解决方案：
```tsx
// 更新接口定义
interface ComponentProps {
  // 现有属性
  existingProp: string;
  // 添加新属性，可选属性使用问号
  newProp?: boolean;
}
```





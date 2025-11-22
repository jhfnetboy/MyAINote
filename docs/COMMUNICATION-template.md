# Tauri 前后端通信示例总结

本文档总结了在 Tauri 应用中前端 (Next.js) 与后端 (Rust) 之间的三种主要通信方式，基于我们的演示项目实现。

## 1. 简单命令调用 (直接调用 Rust)

**使用场景**：获取简单数据或执行不需要复杂参数的操作。

### Rust 端实现
```rust
// src-tauri/src/lib.rs
use std::time::{SystemTime, UNIX_EPOCH};

#[tauri::command]
fn greet() -> String {
  let now = SystemTime::now();
  let epoch_ms = now.duration_since(UNIX_EPOCH).unwrap().as_millis();
  format!("Hello world from Rust! Current epoch: {}", epoch_ms)
}

// 注册命令
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

### 前端实现
```typescript
// src/app/page.tsx
import { invoke } from "@tauri-apps/api/core";

// 在 React 组件中使用
const greet = useCallback((): void => {
  invoke<string>("greet")
    .then((response) => {
      setGreeted(response);
    })
    .catch((err: unknown) => {
      console.error(err);
    });
}, []);

// JSX 部分调用函数
<RoundedButton onClick={greet} title="Call greet from Rust" />
```

**关键点**：
- Rust 侧使用 `#[tauri::command]` 标记函数
- 前端使用 `invoke` 函数调用
- 简单命令可以直接返回值，不需要参数

## 2. 参数化命令调用 (计算器示例)

**使用场景**：需要向 Rust 传递参数并获取结构化返回数据。

### Rust 端实现
```rust
// src-tauri/src/lib.rs
#[derive(serde::Serialize)]
struct CalculationResult {
  result: i32,
  timestamp: u128,
  description: String,
}

#[tauri::command]
async fn calculate(
  window: tauri::Window,
  a: i32,
  b: i32,
  operation: String,
) -> Result<CalculationResult, String> {
  println!("Called from {}", window.label());
  
  let now = SystemTime::now();
  let timestamp = now.duration_since(UNIX_EPOCH).unwrap().as_millis();
  
  let result = match operation.as_str() {
    "add" => a + b,
    "subtract" => a - b,
    "multiply" => a * b,
    "divide" => {
      if b == 0 {
        return Err("Cannot divide by zero".into());
      }
      a / b
    },
    _ => return Err(format!("Unknown operation: {}", operation)),
  };
  
  Ok(CalculationResult {
    result,
    timestamp,
    description: format!("Operation: {} {} {}", a, operation, b),
  })
}

// 注册命令
.invoke_handler(tauri::generate_handler![greet, calculate])
```

### 前端实现
```typescript
// 定义返回类型
interface CalculationResult {
  result: number;
  timestamp: number;
  description: string;
}

// 调用带参数的命令
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
```

**关键点**：
- Rust 侧函数接收多个参数
- 返回结构体必须使用 `#[derive(serde::Serialize)]` 标记
- 使用 `Result<T, E>` 处理可能的错误
- 前端传递命名参数对象
- 使用 TypeScript 接口定义返回类型

## 3. 事件系统 (后台任务向前端发送数据)

**使用场景**：Rust 长时间运行的任务需要向前端发送实时更新。

### Rust 端实现
```rust
// src-tauri/src/lib.rs
use tauri::Manager;
use tauri::Emitter;

#[tauri::command]
async fn start_process_monitoring(window: tauri::Window) -> Result<(), String> {
  let app_handle = window.app_handle().clone();
  let window_label = window.label().to_string();
  
  // 异步任务
  tauri::async_runtime::spawn(async move {
    let mut count = 0;
    loop {
      // 创建要发送的数据
      let process_info = serde_json::json!({
        "id": count,
        "memory_usage": 100 + (count * 10),
        "cpu_usage": (count % 10) as f32 / 10.0,
        "timestamp": SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis()
      });
      
      // 发送全局事件
      app_handle.emit("process-status", process_info.clone()).unwrap();
      
      // 发送窗口特定事件
      if let Some(specific_window) = app_handle.get_webview_window(&window_label) {
        specific_window.emit("window-process-status", process_info).unwrap();
      }
      
      count += 1;
      std::thread::sleep(std::time::Duration::from_secs(1));
      
      // 模拟发送10个事件后停止
      if count >= 10 {
        break;
      }
    }
  });
  
  Ok(())
}

// 注册命令
.invoke_handler(tauri::generate_handler![greet, calculate, start_process_monitoring])
```

### 前端实现
```typescript
// 启动监控
const startMonitoring = useCallback((): void => {
  setProcessStatuses([]);
  setIsMonitoring(true);
  
  invoke("start_process_monitoring")
    .catch((err: unknown) => {
      console.error("Failed to start monitoring:", err);
      setIsMonitoring(false);
    });
}, []);

// 设置事件监听
useEffect(() => {
  setProcessStatuses([]);
  
  const unlisten = listen<ProcessStatus>("process-status", (event) => {
    setProcessStatuses((current) => {
      const newStatuses = [...current, event.payload];
      if (newStatuses.length > 5) {
        return newStatuses.slice(newStatuses.length - 5);
      }
      return newStatuses;
    });
  });
  
  // 当事件接收到10次后，监听完成
  once("window-process-status", () => {
    console.log("Received window-specific event");
  });
  
  return () => {
    // 在组件卸载时取消监听
    unlisten.then(unlistenFn => unlistenFn());
  };
}, []);
```

**关键点**：
- Rust 使用 `app_handle.emit()` 发送全局事件
- 使用 `window.emit()` 发送窗口特定事件
- 前端使用 `listen` 函数设置事件监听器
- 使用 `once` 监听一次性事件
- 在 React 组件卸载时取消事件监听

## 通用经验总结

1. **数据序列化**：
   - Rust 结构体需要使用 `#[derive(serde::Serialize)]` 标记
   - 前端使用 TypeScript 接口定义返回类型
   - 命令参数和返回值需要是可序列化的类型

2. **错误处理**：
   - Rust 使用 `Result<T, E>` 返回错误
   - 前端使用 `.catch()` 处理错误
   - 自定义错误类型提供详细信息

3. **生命周期管理**：
   - 异步任务中使用的 Rust 对象需要满足 `'static` 生命周期
   - 使用 `.clone()` 进行对象所有权转移
   - 前端在组件卸载时需要取消事件监听

4. **性能考虑**：
   - 对于耗时操作，使用 Rust 异步任务
   - 大数据传输考虑分批处理
   - 避免频繁跨进程通信

5. **安全性**：
   - 所有从前端接收的数据都应该进行验证
   - 考虑使用 Tauri 的权限系统限制命令访问

6. **调试技巧**：
   - 使用 `println!` 和 `console.log` 跟踪通信过程
   - 监视 Tauri 的日志输出
   - 在开发模式下启用详细日志

通过这三种通信方式的组合，可以构建复杂的桌面应用，充分利用 Next.js 的前端能力和 Rust 的性能优势。 
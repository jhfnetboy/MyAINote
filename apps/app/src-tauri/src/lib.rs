// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::Manager;
use tauri::Emitter;

mod indexer;
mod rag;
mod embedding;

#[tauri::command]
fn greet() -> String {
  let now = SystemTime::now();
  let epoch_ms = now.duration_since(UNIX_EPOCH).unwrap().as_millis();
  format!("Hello world from Rust! Current epoch: {}", epoch_ms)
}

#[tauri::command]
fn greet_with_ai(name: &str) -> String {
    // Simple candle test: Create a tensor to prove the library is working
    let tensor = candle_core::Tensor::new(&[1.0f32, 2.0f32], &candle_core::Device::Cpu).unwrap();
    format!("Hello {}, AI says: I am alive! My brain (Candle) created a tensor: {:?}", name, tensor)
}

// 添加获取硬件配置的函数
#[derive(serde::Serialize)]
struct HardwareInfo {
  cpu: String,
  memory_total: u64,  // 总内存(MB)
  memory_free: u64,   // 可用内存(MB)
  operating_system: String,
  hostname: String,
  cores: u32,         // CPU核心数
}

#[tauri::command]
fn get_hardware_info() -> Result<HardwareInfo, String> {
  // 使用sysinfo库获取系统信息
  let mut sys = sysinfo::System::new_all();
  sys.refresh_all();
  
  // 获取CPU信息
  let cpu_info = match sys.cpus().first() {
    Some(cpu) => cpu.brand().to_string(),
    None => "Unknown CPU".to_string(),
  };
  
  // 获取内存信息(转换为MB)
  let memory_total = sys.total_memory() / 1024;
  let memory_free = sys.free_memory() / 1024;
  
  // 获取操作系统和主机名
  let os_info = format!("{} {}", sysinfo::System::name().unwrap_or_default(), sysinfo::System::os_version().unwrap_or_default());
  let hostname = sysinfo::System::host_name().unwrap_or_else(|| "Unknown".to_string());
  
  // 获取CPU核心数
  let cores = sys.cpus().len() as u32;
  
  Ok(HardwareInfo {
    cpu: cpu_info,
    memory_total,
    memory_free,
    operating_system: os_info,
    hostname,
    cores,
  })
}

struct Database;

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

#[tauri::command]
async fn start_process_monitoring(window: tauri::Window) -> Result<(), String> {
  // 在真实应用中，这里可能会启动一个后台任务来监视某个进程
  // 在这个演示中，我们只是每秒发送一个模拟的进程状态事件
  
  // 获取应用程序句柄和窗口标签，然后克隆它们以便在异步任务中使用
  let app_handle = window.app_handle().clone();
  let window_label = window.label().to_string();
  
  // 使用tokio创建一个模拟的异步任务
  tauri::async_runtime::spawn(async move {
    let mut count = 0;
    loop {
      // 模拟的进程状态
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
      // 睡眠1秒
      std::thread::sleep(std::time::Duration::from_secs(1));
      
      // 模拟只发送10个事件然后停止
      if count >= 10 {
        break;
      }
    }
  });
  
  Ok(())
}

#[tauri::command]
async fn search_notes(query: String) -> Vec<rag::SearchResult> {
    rag::search(&query).await
}

#[tauri::command]
async fn chat_with_notes(query: String) -> String {
    rag::chat(&query).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Database {})
        .invoke_handler(tauri::generate_handler![
            greet, 
            calculate, 
            start_process_monitoring, 
            get_hardware_info, 
            greet_with_ai,
            search_notes,
            chat_with_notes
        ])
    .setup(|app| {
        // Start the local HTTP server
        tauri::async_runtime::spawn(async move {
            start_server().await;
        });

        // Start the Indexer
        let home_dir = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
        let notes_dir = PathBuf::from(home_dir).join("MyAINote").join("notes");
        
        if !notes_dir.exists() {
             let _ = fs::create_dir_all(&notes_dir);
        }

        let indexer = indexer::Indexer::new(notes_dir.clone());
        tauri::async_runtime::spawn(async move {
            indexer.start().await;
        });

        Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

use axum::{
    routing::{post, get},
    Json, Router,
    http::Method,
};
use tower_http::cors::{Any, CorsLayer};
use std::fs;
use std::path::PathBuf;

#[derive(serde::Deserialize)]
struct SaveNoteRequest {
    title: String,
    url: String,
    html: String,
}

#[derive(serde::Serialize)]
struct SaveNoteResponse {
    status: String,
    path: String,
}

async fn start_server() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any);

    let app = Router::new()
        .route("/save", post(save_note))
        .route("/health", get(|| async { "OK" }))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3030").await.unwrap();
    println!("Server running on http://localhost:3030");
    axum::serve(listener, app).await.unwrap();
}

async fn save_note(Json(payload): Json<SaveNoteRequest>) -> Json<SaveNoteResponse> {
    println!("Received note: {}", payload.title);
    
    // Convert HTML to Markdown
    let markdown_content = html2md::parse_html(&payload.html);
    
    // Add frontmatter
    let date = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let final_content = format!(
        "---\ntitle: \"{}\"\nurl: \"{}\"\ndate: \"{}\"\n---\n\n{}",
        payload.title, payload.url, date, markdown_content
    );

    // Determine save path
    // For now, save to a 'notes' directory in the user's home folder or app local data
    // Using home_dir for simplicity in this phase
    let home_dir = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    let notes_dir = PathBuf::from(home_dir).join("MyAINote").join("notes");
    
    if !notes_dir.exists() {
        fs::create_dir_all(&notes_dir).unwrap();
    }

    // Sanitize filename
    let safe_title: String = payload.title.chars()
        .map(|c| if c.is_alphanumeric() || c == ' ' || c == '-' { c } else { '_' })
        .collect();
    let filename = format!("{}.md", safe_title.trim());
    let file_path = notes_dir.join(&filename);

    // Write to file
    match fs::write(&file_path, final_content) {
        Ok(_) => Json(SaveNoteResponse {
            status: "success".to_string(),
            path: file_path.to_string_lossy().to_string(),
        }),
        Err(e) => Json(SaveNoteResponse {
            status: format!("error: {}", e),
            path: "".to_string(),
        }),
    }
}

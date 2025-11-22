# Tauri + Next.js Demo 开发计划

## 项目目标

创建一个基于 Tauri 2.0 和 Next.js 15 的演示应用，展示前端与 Rust 后端的交互方式。

## 开发步骤

1. ✅ 设置项目模板 - 使用 Tauri 2.0 + Next.js 15 App Router 模板
2. ✅ 实现基础的命令系统演示
   - ✅ 创建简单的 `greet` 命令
   - ✅ 创建复杂的 `calculate` 命令，接受参数并返回结构化数据
3. ✅ 实现事件系统演示
   - ✅ 创建 `start_process_monitoring` 命令，触发后台任务
   - ✅ 从 Rust 发送全局事件和窗口特定事件
   - ✅ 在前端监听和处理这些事件
4. ✅ 测试与优化
   - ✅ 测试所有功能
   - ✅ 修复编译错误（添加缺少的 Emitter trait 导入）
   - ✅ 修复 Tauri 2.0 API 变更问题（emit_all 变更为 emit）
   - ✅ 修复生命周期问题（app_handle 需要被克隆）
5. ✅ 准备发布
   - ✅ 更新文档（CHANGES.md, PLAN.md, FEATURES.md, DEPLOY.md）
   - ✅ 应用程序已成功构建和运行

## 技术栈

- Tauri 2.0
- Next.js 15 (使用 App Router)
- TailwindCSS 4
- TypeScript
- pnpm 包管理器 
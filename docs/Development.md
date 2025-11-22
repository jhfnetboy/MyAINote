# Development Guide

## 开发思路和规则
1. 循序渐进，先从最基础的Tauri应用开始，然后一步步完成，每个新feat或者新技术栈的引入之前，要保障原来的已经稳定可靠。
2. 业务细节可以后面开发，整体技术架构先验证是否可行。
3. 每个开发目标，新开一个分支，我的建议：
    1. Tauri通信+模型调用，一个分支
    2. 插件和数据抓取，一个分支
    3. 数据识别，一个分支
    4. 数据存储，一个分支
    5. 向量化，一个分支
    6. RAG存储，一个分支
    7. 知识库笔记展示和搜索，一个分支
    8. 基础功能：例如系统/AI配置，多语言等等的，一个分支
    9. 其他
 4.  一些个人偏好
     1. use openspec
     2. use pnpm, no npm
     3. use viem, no ethers
     4. use foundry, no hardhat
     5. only use private key/api key from .env, no record in any docs or codes or read, input, in anywhere. 
     6. use pre-commit .githooks to filter the private key/api key/any sensitive info
     7. all docs put into docs folder except readme
     8. use forge script，不要忘记先dry run，再broadcast
     9. 禁止滥用文档，不要每个细小工作都建立文档。
     10. 任何工作完成后，先build，如果是页面工作，可以使用playwright或者Antigravity Browser Extension来进行测试，测试通过后，有bug需要fix，再commit，再push。
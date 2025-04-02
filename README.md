# Pot-App Gemini OCR 插件

一个基于 Google Gemini 模型的 [Pot-App](https://github.com/pot-app/pot-desktop) OCR（光学字符识别）插件。

## 功能特点

- 使用 Google 强大的 Gemini AI 模型进行 OCR
- 支持多种 Gemini 模型选项：
  - Gemini 2.0 Flash
  - Gemini 2.0 Flash Lite
  - 自定义模型
- 可自定义 OCR 提示词
- 支持多种语言
- 内置错误处理和验证

## 安装方法

1. 从 [Releases](https://github.com/gaivrt/pot-app-recognize-plugin-gemini/releases) 页面下载最新的 `.potext` 文件
2. 将插件导入到 Pot-App 中

## 配置说明

插件需要以下配置：

1. **Google AI API 密钥**（必需）
   - 从 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取 API 密钥
   - 在插件设置中输入密钥

2. **模型选择**（可选）
   - 从预定义模型中选择：
     - Gemini 2.0 Flash
     - Gemini 2.0 Flash Lite
   - 或使用自定义模型

3. **自定义模型名称**（可选）
   - 如果想使用预定义选项之外的特定 Gemini 模型
   - 如果指定，将覆盖模型选择

4. **自定义 OCR 提示词**（可选）
   - 自定义用于 OCR 的提示词
   - 默认值："Extract text from this image"

## 支持的语言

- 自动检测
- 中文（简体和繁体）
- 英语
- 日语
- 韩语
- 法语
- 西班牙语
- 俄语
- 德语
- 意大利语
- 土耳其语
- 葡萄牙语（葡萄牙和巴西）
- 越南语
- 泰语
- 阿拉伯语
- 印地语
- 波斯语

## 开发说明

本插件使用 JavaScript 开发，并使用 Gemini API 实现 OCR 功能。主要实现代码在 `main.js` 中。

### 构建

项目包含一个自动构建插件的 GitHub Actions 工作流：

```yaml
name: Build
on: push
```

当你推送更改或创建发布时，它会创建一个包含插件文件的 `.potext` 文件。

## 许可证

本项目采用 GNU 通用公共许可证 v3.0 - 详见 [LICENSE](LICENSE) 文件。

## 贡献

欢迎贡献！请随时提交 Pull Request。


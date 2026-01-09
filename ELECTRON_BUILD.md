# Electron 打包说明

## 开发模式运行

```bash
npm run electron:dev
```

这将启动 Vite 开发服务器和 Electron 应用。

## 打包为 EXE 文件

### 1. 构建应用

```bash
npm run dist
```

这将：
1. 先运行 `vite build` 构建前端应用
2. 然后使用 `electron-builder` 打包为 Windows 安装程序

### 2. 输出位置

打包完成后，安装程序将位于 `release/` 目录中：
- Windows: `release/校园洗涤员工日报系统 Setup 1.0.0.exe`

### 3. 分发

可以将生成的 `.exe` 文件分发给其他用户。用户运行安装程序后，应用将安装到系统中，并可以在开始菜单和桌面上找到快捷方式。

## 注意事项

1. **图标文件**：如果需要自定义应用图标，请将图标文件放在 `build/icon.ico`（Windows）和 `build/icon.png`（其他平台）
2. **首次打包**：首次打包可能需要较长时间，因为需要下载 Electron 二进制文件
3. **文件大小**：打包后的安装程序可能较大（通常 100-200MB），因为包含了 Electron 运行时和所有依赖

## 自定义配置

可以在 `package.json` 的 `build` 字段中自定义打包配置，例如：
- 修改应用 ID
- 更改输出目录
- 调整安装选项
- 添加更多平台支持

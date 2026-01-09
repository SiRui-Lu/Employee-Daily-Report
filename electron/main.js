const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const { fileURLToPath } = require('url');

// 判断是否为开发模式
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// 注册自定义协议来处理资源加载
function setupProtocol() {
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.substr(6); // 移除 'app://' 前缀
    const appPath = app.getAppPath();
    const filePath = path.join(appPath, url);
    callback({ path: filePath });
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, '../build/icon.png'), // 可选：应用图标
    titleBarStyle: 'default',
    show: false // 先不显示，等加载完成后再显示
  });

  // 加载应用
  if (isDev) {
    // 开发模式：连接到 Vite 开发服务器
    mainWindow.loadURL('http://localhost:3000');
    // 开发模式下打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载打包后的文件
    // 构建脚本已经修复了 HTML 中的路径，直接加载即可
    const appPath = app.getAppPath();
    const indexPath = path.join(appPath, 'dist', 'index.html');
    
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
      mainWindow.webContents.executeJavaScript(`
        document.body.innerHTML = '<div style="padding: 20px; font-family: Arial; text-align: center;">
          <h1>加载错误</h1>
          <p>无法加载应用文件，请检查安装是否完整。</p>
          <p>错误信息：${err.message}</p>
        </div>';
      `);
      mainWindow.show();
    });
  }

  // 窗口加载完成后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 添加错误处理
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL, errorCode, errorDescription);
  });

  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[Renderer ${level}]:`, message);
  });

  // 处理窗口关闭
  mainWindow.on('closed', () => {
    // 在 macOS 上，即使关闭所有窗口，应用通常仍保持运行
    // 除非用户明确退出（Cmd + Q）
  });
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用
app.whenReady().then(() => {
  // 在生产模式下设置协议
  if (!isDev) {
    setupProtocol();
  }
  createWindow();

  // macOS 特定：当点击 dock 图标且没有其他窗口打开时，重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口关闭时退出应用（Windows 和 Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 安全设置：防止新窗口打开
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});

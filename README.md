# ISFP 电子飞行包 (EFB)

云际模拟飞行连飞平台（Interstellar Simulation Flight Platform）电子飞行包，基于 Vue 3 + Vite 构建。

## 功能

| 模块 | 说明 |
|------|------|
| 航路查询 | 输入起降机场 ICAO 代码，获取完整航路与提交航路，支持一键复制提交航路 |
| 气象报文 | METAR 实况报文 + TAF 预报报文查询，TAF 支持批量（逗号分隔） |
| 机场信息 | 机场名称、城市、国家、标高、经纬度、时区等信息 |
| 在线信息 | ISFP 连飞平台在线客户端、飞行员、管制员实时状态，每 30 秒自动轮询 |

## 技术栈

- **Vue 3** (Composition API / `<script setup>`)
- **Vite 5**（开发代理转发 API 跨域）
- 玻璃拟态（Glassmorphism）UI 风格，纯 CSS 变量主题系统
- 内联 SVG 矢量图标组件，零图标库依赖
- 主题跟随系统（`prefers-color-scheme`）并支持手动切换，localStorage 记忆偏好
- PWA 可安装（手写 manifest + Service Worker，离线缓存应用外壳）

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`

## 生产构建

```bash
npm run build
```

产出在 `dist/` 目录，可直接用任意静态服务器或参考 `nginx.conf` 部署。

## PWA 安装

部署到 HTTPS 后，浏览器地址栏会出现安装提示，可"添加到主屏幕"作为独立应用运行；Service Worker 会缓存应用外壳，离线仍可打开界面（实时 API 数据需联网）。

## 项目结构

```
├── index.html
├── vite.config.js
├── public/
│   ├── airports.json              # 机场数据库
│   ├── country_multilingual.csv   # 国家名称翻译
│   ├── timezone_translations.json # 时区翻译
│   ├── manifest.json              # PWA 应用清单
│   ├── sw.js                      # Service Worker
│   └── logo/                      # 图标文件
└── src/
    ├── main.js                    # 入口，注册 Service Worker
    ├── App.vue                    # 布局、侧边栏、主题切换
    ├── api/
    │   └── index.js               # API 封装
    └── components/
        ├── AirportInfo.vue
        ├── MetarTafQuery.vue
        ├── OnlineInfo.vue
        ├── RouteQuery.vue
        ├── UtcClock.vue            # UTC 翻牌时钟
        └── Icon.vue                # 内联 SVG 图标组件
```

## 主站

[www.flyisfp.com](https://www.flyisfp.com)

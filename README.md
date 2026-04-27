# ISFP 电子飞行包 (EFB)

云际模拟飞行连飞平台（Interstellar Simulation Flight Platform）电子飞行包，基于 Vue 3 + Vite 构建。

## 功能

| 模块 | 说明 |
|------|------|
| 🛫 航路查询 | 输入起降机场 ICAO 代码，获取完整航路与提交航路 |
| 🌤️ 气象报文 | METAR 实况报文 + TAF 预报报文查询，TAF 支持批量 |
| 📍 机场信息 | 机场名称、城市、国家、标高、经纬度、时区等信息 |
| 👥 在线信息 | ISFP 连飞平台在线客户端、飞行员、管制员实时状态 |

## 技术栈

- **Vue 3** (Composition API / `<script setup>`)
- **Vite 5** (开发代理转发 API 跨域)
- 纯 CSS 变量主题系统（深色/浅色一键切换）

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

产出在 `dist/` 目录。

## 项目结构

```
├── index.html
├── vite.config.js
├── public/
│   ├── airports.json              # 机场数据库
│   ├── country_multilingual.csv   # 国家名称翻译
│   ├── timezone_translations.json # 时区翻译
│   └── logo/                      # 图标文件
└── src/
    ├── main.js
    ├── App.vue
    ├── api/
    │   └── index.js               # API 封装
    └── components/
        ├── AirportInfo.vue
        ├── MetarTafQuery.vue
        ├── OnlineInfo.vue
        ├── RouteQuery.vue
        └── UtcClock.vue
```

## API 数据来源

- 航路：`route.hkrscoc.com`
- METAR / 在线状态：`isfpapi.flyisfp.com`
- TAF：`aviationweather.gov`

## 主站

[www.flyisfp.com](https://www.flyisfp.com)

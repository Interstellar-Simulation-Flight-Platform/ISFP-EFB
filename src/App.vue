<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <img src="/logo/logo.png" alt="ISFP" class="logo-img" @error="onLogoError" />
        <h1>ISFP 电子飞行包</h1>
      </div>
      <div class="header-right">
        <UtcClock />
        <button class="theme-btn" @click="toggleTheme" :title="theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'">
          <span v-if="theme === 'dark'">🌙</span>
          <span v-else>☀️</span>
        </button>
        <a href="https://www.flyisfp.com" target="_blank" class="external-link" title="访问ISFP主站">
          🌐 主站
        </a>
      </div>
    </header>

    <div class="app-body">
      <aside :class="['sidebar', { collapsed: sidebarCollapsed }]">
        <div class="sidebar-head">
          <span class="sidebar-title">导航</span>
        </div>
        <nav class="side-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['side-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
            :title="sidebarCollapsed ? tab.label : ''"
          >
            <span class="side-icon">{{ tab.icon }}</span>
            <span class="side-label">{{ tab.label }}</span>
            <span v-if="activeTab === tab.id && !sidebarCollapsed" class="side-dot"></span>
          </button>
          <a
            href="https://eaip.flyisfp.com"
            target="_blank"
            class="side-btn side-link"
            title="航图查询"
          >
            <span class="side-icon">🗺️</span>
            <span class="side-label">航图查询</span>
          </a>
        </nav>
        <div class="sidebar-foot">
          <button class="toggle-btn" @click="sidebarCollapsed = !sidebarCollapsed" :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'">
            <span v-if="sidebarCollapsed">▶</span>
            <span v-else>◀</span>
          </button>
        </div>
      </aside>

      <main class="main-content">
        <RouteQuery v-if="activeTab === 'route'" />
        <MetarTafQuery v-else-if="activeTab === 'weather'" />
        <AirportInfo v-else-if="activeTab === 'airport'" />
        <OnlineInfo v-else-if="activeTab === 'online'" />
      </main>
    </div>

    <footer class="app-footer">
      <span>© ISFP 云际模拟飞行连飞平台</span>
      <span class="sep">|</span>
      <a href="https://www.flyisfp.com" target="_blank">www.flyisfp.com</a>
      <span class="sep">|</span>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="icp">京ICP备2026004204号-1</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RouteQuery from './components/RouteQuery.vue'
import MetarTafQuery from './components/MetarTafQuery.vue'
import AirportInfo from './components/AirportInfo.vue'
import OnlineInfo from './components/OnlineInfo.vue'
import UtcClock from './components/UtcClock.vue'

const activeTab = ref('route')
const sidebarCollapsed = ref(false)
const theme = ref('light')

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t)
}

function toggleTheme() {
  const next = theme.value === 'dark' ? 'light' : 'dark'
  theme.value = next
  localStorage.setItem('efb-theme', next)
  applyTheme(next)
}

onMounted(() => {
  const saved = localStorage.getItem('efb-theme')
  if (saved === 'light' || saved === 'dark') {
    theme.value = saved
  }
  applyTheme(theme.value)
})

const tabs = [
  { id: 'route', label: '航路查询', icon: '🛫' },
  { id: 'weather', label: '气象报文', icon: '🌤️' },
  { id: 'airport', label: '机场信息', icon: '📍' },
  { id: 'online', label: '在线信息', icon: '👥' },
]

function onLogoError(e) {
  e.target.style.display = 'none'
}
</script>

<style>
:root {
  --bg-root: #0a1628;
  --bg-surface: #0f1f35;
  --bg-sidebar: #0b1625;
  --bg-input: #0a1628;
  --bg-code: #0d2137;
  --bg-header-start: #0d2137;
  --bg-header-end: #060f1c;
  --border: #1a3a5c;
  --border-light: #1a3555;
  --text: #e0e6f0;
  --text-dim: #6a809a;
  --text-muted: #3a5a7a;
  --text-accent: #7ec8ff;
  --accent: #2080e8;
  --accent-hover: #3a90f0;
  --green: #4aad5e;
  --green-border: #2a5a3c;
  --red: #ff6b6b;
  --red-bg: rgba(255, 80, 80, 0.1);
  --red-border: rgba(255, 80, 80, 0.3);
  --hover-bg: rgba(126, 200, 255, 0.05);
  --active-bg: rgba(126, 200, 255, 0.08);
  --toggle-bg: rgba(126, 200, 255, 0.06);
  --toggle-hover: rgba(126, 200, 255, 0.14);
  --divider: #1a3a5c;
  --shadow: rgba(0,0,0,0.2);
}

[data-theme="light"] {
  --bg-root: #f0f4f8;
  --bg-surface: #ffffff;
  --bg-sidebar: #f7f9fb;
  --bg-input: #eef2f6;
  --bg-code: #eef2f6;
  --bg-header-start: #e4eaf2;
  --bg-header-end: #d8e0ea;
  --border: #d0d8e0;
  --border-light: #d8e0e8;
  --text: #1a2a3a;
  --text-dim: #5a6a7a;
  --text-muted: #8a9aaa;
  --text-accent: #1a6dd4;
  --accent: #1a6dd4;
  --accent-hover: #3a8df0;
  --green: #2a7d3e;
  --green-border: #3a8d4e;
  --red: #cc3333;
  --red-bg: rgba(200, 50, 50, 0.08);
  --red-border: rgba(200, 50, 50, 0.25);
  --hover-bg: rgba(26, 109, 212, 0.06);
  --active-bg: rgba(26, 109, 212, 0.1);
  --toggle-bg: rgba(26, 109, 212, 0.06);
  --toggle-hover: rgba(26, 109, 212, 0.14);
  --divider: #d0d8e0;
  --shadow: rgba(0,0,0,0.06);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  background: var(--bg-root);
  color: var(--text);
  height: 100vh;
  overflow: hidden;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  background: linear-gradient(135deg, var(--bg-header-start) 0%, var(--bg-header-end) 100%);
  border-bottom: 1px solid var(--border);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  flex-shrink: 0;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-img {
  width: 26px;
  height: 26px;
  object-fit: contain;
  border-radius: 4px;
}

.header-left h1 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-accent);
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-light);
  background: var(--toggle-bg);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  transition: all 0.2s;
}

.theme-btn:hover {
  background: var(--toggle-hover);
}

.external-link {
  color: var(--green);
  text-decoration: none;
  font-size: 13px;
  padding: 5px 12px;
  border: 1px solid var(--green-border);
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.external-link:hover {
  background: var(--hover-bg);
}

.app-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.sidebar {
  width: 160px;
  flex-shrink: 0;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 52px;
}

.sidebar.collapsed .sidebar-head {
  height: 0;
  padding: 0;
  border-bottom: none;
  margin-bottom: 0;
  overflow: hidden;
}

.sidebar.collapsed .side-dot {
  display: none;
}

.sidebar.collapsed .side-btn {
  justify-content: center;
  padding: 12px 0;
  gap: 0;
}

.sidebar.collapsed .side-label {
  display: none;
}

.sidebar.collapsed .sidebar-foot {
  padding: 8px 0;
}

.sidebar-head {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 14px;
  border-bottom: 1px solid var(--divider);
  margin-bottom: 4px;
}

.sidebar-title {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

.side-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 4px 8px;
}

.side-nav-divider {
  height: 1px;
  background: var(--divider);
  margin: 4px 6px;
  transition: all 0.25s ease;
}

.sidebar.collapsed .side-nav-divider {
  margin: 4px 10px;
}

.side-link {
  text-decoration: none;
}

.side-link:hover {
  color: var(--text-accent);
}

.side-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border: none;
  background: transparent;
  color: var(--text-dim);
  font-size: 13px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.18s;
  font-family: inherit;
  text-align: left;
  width: 100%;
  position: relative;
}

.side-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--text-accent);
  border-radius: 0 2px 2px 0;
  transition: height 0.2s ease;
}

.side-btn:hover {
  background: var(--hover-bg);
  color: var(--text);
}

.side-btn.active {
  background: var(--active-bg);
  color: var(--text-accent);
}

.side-btn.active::before {
  height: 20px;
}

.side-icon {
  font-size: 17px;
  flex-shrink: 0;
  line-height: 1;
}

.side-label {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.side-dot {
  margin-left: auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-accent);
  flex-shrink: 0;
}

.sidebar-foot {
  display: flex;
  justify-content: center;
  padding: 8px 8px;
  border-top: 1px solid var(--divider);
  margin: 4px 8px 0;
}

.toggle-btn {
  width: 34px;
  height: 34px;
  border: none;
  background: var(--toggle-bg);
  color: var(--text-dim);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
  font-family: inherit;
}

.toggle-btn:hover {
  background: var(--toggle-hover);
  color: var(--text-accent);
}

.main-content {
  flex: 1;
  padding: 20px 24px;
  min-width: 0;
  overflow-y: auto;
}

.app-footer {
  background: var(--bg-sidebar);
  border-top: 1px solid var(--border);
  padding: 7px 24px;
  text-align: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--text-muted);
}

.app-footer a {
  color: var(--text-dim);
  text-decoration: none;
}

.app-footer a:hover {
  color: var(--text-accent);
}

.app-footer .sep {
  color: var(--divider);
}

.app-footer .icp {
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .sidebar {
    width: 52px;
  }

  .sidebar .sidebar-head {
    height: 0;
    padding: 0;
    border-bottom: none;
    margin-bottom: 0;
    overflow: hidden;
  }

  .sidebar .side-label {
    display: none;
  }

  .sidebar .side-dot {
    display: none;
  }

  .sidebar .side-btn {
    justify-content: center;
    padding: 12px 0;
    gap: 0;
  }

  .sidebar .sidebar-foot {
    padding: 8px 0;
  }

  .sidebar.collapsed {
    width: 52px;
  }

  .main-content {
    padding: 16px;
  }
}

@media (max-width: 600px) {
  .app-header {
    height: auto;
    padding: 8px 12px;
    gap: 8px;
  }

  .header-left h1 {
    font-size: 14px;
  }

  .app-body {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    padding: 0;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .sidebar.collapsed {
    width: 100%;
  }

  .sidebar-head {
    display: none;
  }

  .sidebar-foot {
    display: flex;
    border-top: none;
    margin: 0;
    padding: 0 8px;
    align-items: center;
  }

  .side-nav {
    flex-direction: row;
    padding: 4px 8px;
    overflow-x: auto;
  }

  .side-btn {
    white-space: nowrap;
    width: auto;
    padding: 8px 12px;
    font-size: 12px;
  }

  .side-label {
    opacity: 1 !important;
    width: auto !important;
  }

  .side-dot {
    display: none !important;
  }

  .side-btn::before {
    display: none;
  }

  .app-footer {
    font-size: 10px;
    gap: 6px;
  }
}
</style>

<template>
  <div class="app-container">
    <div class="bg-decor">
      <span class="blob blob-1"></span>
      <span class="blob blob-2"></span>
      <span class="blob blob-3"></span>
    </div>

    <header class="app-header">
      <div class="header-left">
        <img src="/logo/logo.png" alt="ISFP" class="logo-img" @error="onLogoError" />
        <div class="title-group">
          <h1>ISFP 电子飞行包</h1>
          <span class="title-sub">Electronic Flight Bag</span>
        </div>
      </div>
      <div class="header-right">
        <UtcClock />
        <button class="icon-btn" @click="toggleTheme" :title="theme === 'dark' ? '切换到跟随系统' : theme === 'light' ? '切换到深色模式' : '切换到浅色模式'">
          <Icon :name="theme === 'dark' ? 'moon' : theme === 'light' ? 'sun' : 'monitor'" :size="18" />
        </button>
        <a href="https://www.flyisfp.com" target="_blank" rel="noopener noreferrer" class="ghost-link" title="访问ISFP主站">
          <Icon name="globe" :size="16" />
          <span>主站</span>
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
            <span class="side-icon"><Icon :name="tab.icon" :size="20" /></span>
            <span class="side-label">{{ tab.label }}</span>
            <span v-if="activeTab === tab.id && !sidebarCollapsed" class="side-dot"></span>
          </button>
        </nav>
        <div class="sidebar-foot">
          <button class="toggle-btn" @click="sidebarCollapsed = !sidebarCollapsed" :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'">
            <Icon :name="sidebarCollapsed ? 'chevronRight' : 'chevronLeft'" :size="16" />
          </button>
        </div>
      </aside>

      <main :class="['main-content', { 'chart-mode': activeTab === 'chart' }]">
        <div :class="['content-inner', { 'chart-inner': activeTab === 'chart' }]">
          <RouteQuery v-if="activeTab === 'route'" />
          <MetarTafQuery v-else-if="activeTab === 'weather'" />
          <AirportInfo v-else-if="activeTab === 'airport'" />
          <OnlineInfo v-else-if="activeTab === 'online'" />
          <ChartQuery v-else-if="activeTab === 'chart'" />
        </div>
      </main>
    </div>

    <footer class="app-footer">
      <span>© ISFP 云际模拟飞行连飞平台</span>
      <span class="sep">·</span>
      <a href="https://www.flyisfp.com" target="_blank" rel="noopener noreferrer">www.flyisfp.com</a>
      <span class="sep">·</span>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="icp">京ICP备2026004204号-1</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import RouteQuery from './components/RouteQuery.vue'
import MetarTafQuery from './components/MetarTafQuery.vue'
import AirportInfo from './components/AirportInfo.vue'
import OnlineInfo from './components/OnlineInfo.vue'
import ChartQuery from './components/ChartQuery.vue'
import UtcClock from './components/UtcClock.vue'
import Icon from './components/Icon.vue'

const activeTab = ref('route')
const sidebarCollapsed = ref(false)
// 'light' | 'dark' | 'system' 三态循环切换
const theme = ref('system')
const THEME_ORDER = ['light', 'dark', 'system']
let mediaQuery = null
let mediaHandler = null

function applyTheme() {
  const resolved = theme.value === 'system'
    ? (mediaQuery && mediaQuery.matches ? 'dark' : 'light')
    : theme.value
  document.documentElement.setAttribute('data-theme', resolved)
}

function toggleTheme() {
  const next = THEME_ORDER[(THEME_ORDER.indexOf(theme.value) + 1) % THEME_ORDER.length]
  theme.value = next
  localStorage.setItem('efb-theme', next)
  applyTheme()
}

onMounted(() => {
  const saved = localStorage.getItem('efb-theme')
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    theme.value = saved
  }
  if (window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaHandler = () => {
      if (theme.value === 'system') applyTheme()
    }
    mediaQuery.addEventListener('change', mediaHandler)
  }
  applyTheme()
})

onUnmounted(() => {
  if (mediaQuery && mediaHandler) mediaQuery.removeEventListener('change', mediaHandler)
})

const tabs = [
  { id: 'route', label: '航路查询', icon: 'route' },
  { id: 'chart', label: '航图查询', icon: 'map' },
  { id: 'weather', label: '气象报文', icon: 'weather' },
  { id: 'airport', label: '机场信息', icon: 'airport' },
  { id: 'online', label: '在线信息', icon: 'users' },
]

function onLogoError(e) {
  e.target.style.display = 'none'
}
</script>

<style>
:root {
  --bg-base: #eef2f9;
  --bg-grad-1: #c9d8f5;
  --bg-grad-2: #d8e4f7;
  --bg-grad-3: #e5dcef;
  --glass: rgba(255, 255, 255, 0.55);
  --glass-strong: rgba(255, 255, 255, 0.72);
  --glass-input: rgba(255, 255, 255, 0.5);
  --glass-code: rgba(245, 247, 252, 0.6);
  --glass-sidebar: rgba(255, 255, 255, 0.5);
  --glass-header: rgba(255, 255, 255, 0.45);
  --border: rgba(150, 170, 200, 0.35);
  --border-light: rgba(150, 170, 200, 0.22);
  --border-strong: rgba(120, 145, 180, 0.5);
  --text: #1a2740;
  --text-dim: #5a6a86;
  --text-muted: #8a99b3;
  --text-accent: #1962d6;
  --accent: #1a6dd4;
  --accent-2: #4f8ef7;
  --accent-hover: #3a8df0;
  --accent-grad: linear-gradient(135deg, #1a6dd4, #4f8ef7);
  --green: #1f9d57;
  --green-soft: rgba(31, 157, 87, 0.12);
  --green-border: rgba(31, 157, 87, 0.4);
  --purple: #8b5cf6;
  --purple-soft: rgba(139, 92, 246, 0.14);
  --orange: #e8893a;
  --orange-soft: rgba(232, 137, 58, 0.16);
  --red: #d63a3a;
  --red-bg: rgba(214, 58, 58, 0.1);
  --red-border: rgba(214, 58, 58, 0.3);
  --hover-bg: rgba(26, 109, 212, 0.08);
  --active-bg: rgba(26, 109, 212, 0.12);
  --toggle-bg: rgba(255, 255, 255, 0.35);
  --toggle-hover: rgba(26, 109, 212, 0.12);
  --divider: rgba(150, 170, 200, 0.25);
  --shadow-sm: 0 2px 8px rgba(40, 70, 120, 0.06);
  --shadow: 0 8px 32px rgba(40, 70, 120, 0.1);
  --shadow-lg: 0 16px 48px rgba(40, 70, 120, 0.15);
  --blur: 18px;
  --scrollbar-thumb: rgba(150, 170, 200, 0.45);
  --scrollbar-thumb-hover: rgba(120, 145, 180, 0.7);
}

[data-theme="dark"] {
  --bg-base: #000000;
  --bg-grad-1: #141414;
  --bg-grad-2: #0a0a0a;
  --bg-grad-3: #191919;
  --glass: rgba(18, 18, 18, 0.55);
  --glass-strong: rgba(24, 24, 24, 0.78);
  --glass-input: rgba(14, 14, 14, 0.6);
  --glass-code: rgba(12, 12, 12, 0.6);
  --glass-sidebar: rgba(16, 16, 16, 0.55);
  --glass-header: rgba(14, 14, 14, 0.5);
  --border: rgba(255, 255, 255, 0.14);
  --border-light: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.24);
  --text: #e8edf5;
  --text-dim: #9aa3b2;
  --text-muted: #5f6773;
  --text-accent: #6fb5ff;
  --accent: #3a90f0;
  --accent-2: #62aefc;
  --accent-hover: #5aa6fa;
  --accent-grad: linear-gradient(135deg, #2a7de8, #5aa6fa);
  --green: #4ec574;
  --green-soft: rgba(78, 197, 116, 0.14);
  --green-border: rgba(78, 197, 116, 0.4);
  --purple: #a78bfa;
  --purple-soft: rgba(167, 139, 250, 0.16);
  --orange: #f0a85a;
  --orange-soft: rgba(240, 168, 90, 0.16);
  --red: #ff6b6b;
  --red-bg: rgba(255, 90, 90, 0.12);
  --red-border: rgba(255, 90, 90, 0.32);
  --hover-bg: rgba(255, 255, 255, 0.07);
  --active-bg: rgba(111, 181, 255, 0.14);
  --toggle-bg: rgba(255, 255, 255, 0.35);
  --toggle-hover: rgba(255, 255, 255, 0.08);
  --divider: rgba(255, 255, 255, 0.12);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.25);
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.45);
  --blur: 20px;
  --scrollbar-thumb: rgba(255, 255, 255, 0.13);
  --scrollbar-thumb-hover: rgba(255, 255, 255, 0.24);
}

/* 深色模式: 纯黑无光晕 */
[data-theme="dark"] .app-container { background: var(--bg-base); }
[data-theme="dark"] .bg-decor { display: none; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; }

/* 深浅色统一的滚动条, 轨道透明; 滑块亮度随主题(深色用暗灰不刺眼) */
html { scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) transparent; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover); }
::-webkit-scrollbar-corner { background: transparent; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  background: var(--bg-base);
  color: var(--text);
  height: 100vh;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background:
    radial-gradient(1200px 600px at 10% -10%, var(--bg-grad-1), transparent 60%),
    radial-gradient(1000px 500px at 110% 10%, var(--bg-grad-3), transparent 55%),
    radial-gradient(900px 700px at 50% 120%, var(--bg-grad-2), transparent 60%),
    var(--bg-base);
}

.bg-decor { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
.blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5; animation: float 18s ease-in-out infinite; }
.blob-1 { width: 420px; height: 420px; top: -120px; left: -80px; background: radial-gradient(circle, var(--accent), transparent 70%); }
.blob-2 { width: 380px; height: 380px; top: 30%; right: -100px; background: radial-gradient(circle, var(--purple), transparent 70%); animation-delay: -6s; }
.blob-3 { width: 360px; height: 360px; bottom: -120px; left: 30%; background: radial-gradient(circle, var(--accent-2), transparent 70%); animation-delay: -12s; }

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -40px) scale(1.08); }
  66% { transform: translate(-20px, 30px) scale(0.95); }
}

.app-header {
  position: relative; z-index: 2;
  background: var(--glass-header);
  backdrop-filter: blur(var(--blur)); -webkit-backdrop-filter: blur(var(--blur));
  border-bottom: 1px solid var(--border);
  padding: 0 22px;
  display: flex; align-items: center; justify-content: space-between;
  height: 56px; flex-shrink: 0; gap: 16px;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.logo-img { width: 30px; height: 30px; object-fit: contain; border-radius: 7px; }
.title-group { display: flex; flex-direction: column; line-height: 1.1; }
.header-left h1 { font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: 0.5px; }
.title-sub { font-size: 10px; color: var(--text-muted); letter-spacing: 1.5px; text-transform: uppercase; }
.header-right { display: flex; align-items: center; gap: 10px; }

.icon-btn {
  width: 34px; height: 34px;
  border: 1px solid var(--border);
  background: var(--glass);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  border-radius: 10px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-dim); transition: all 0.2s;
}
.icon-btn:hover { background: var(--toggle-hover); color: var(--text-accent); border-color: var(--border-strong); }

.ghost-link {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--text-dim); text-decoration: none; font-size: 13px;
  padding: 7px 12px; border: 1px solid var(--border);
  background: var(--glass);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  border-radius: 10px; transition: all 0.2s; white-space: nowrap;
}
.ghost-link:hover { color: var(--text-accent); border-color: var(--border-strong); background: var(--toggle-hover); }

.app-body { display: flex; flex: 1; min-height: 0; position: relative; z-index: 1; }

.sidebar {
  width: 184px; flex-shrink: 0;
  background: var(--glass-sidebar);
  backdrop-filter: blur(var(--blur)); -webkit-backdrop-filter: blur(var(--blur));
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.sidebar.collapsed { width: 64px; }
.sidebar.collapsed .sidebar-head { height: 0; padding: 0; border-bottom: none; margin-bottom: 0; overflow: hidden; }
.sidebar.collapsed .side-dot { display: none; }
.sidebar.collapsed .side-btn { justify-content: center; padding: 12px 0; gap: 0; }
.sidebar.collapsed .side-label { display: none; }
.sidebar.collapsed .side-ext { display: none; }
.sidebar.collapsed .sidebar-foot { padding: 8px 0; }

.sidebar-head {
  display: flex; align-items: center; height: 44px;
  padding: 0 16px; border-bottom: 1px solid var(--divider); margin-bottom: 6px;
}
.sidebar-title { font-size: 11px; color: var(--text-muted); font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }

.side-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 4px 10px; }
.side-link { text-decoration: none; }
.side-link:hover { color: var(--text-accent); }

.side-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 14px; border: none; background: transparent;
  color: var(--text-dim); font-size: 13px; cursor: pointer;
  border-radius: 10px; transition: all 0.18s; font-family: inherit;
  text-align: left; width: 100%; position: relative;
}
.side-btn::before {
  content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 0; background: var(--text-accent); border-radius: 0 2px 2px 0;
  transition: height 0.2s ease;
}
.side-btn:hover { background: var(--hover-bg); color: var(--text); }
.side-btn.active { background: var(--active-bg); color: var(--text-accent); }
.side-btn.active::before { height: 22px; }
.side-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.side-label { font-size: 13px; font-weight: 500; white-space: nowrap; }
.side-dot { margin-left: auto; width: 6px; height: 6px; border-radius: 50%; background: var(--text-accent); flex-shrink: 0; }
.side-ext { margin-left: auto; color: var(--text-muted); display: flex; }

.sidebar-foot {
  display: flex; justify-content: center; padding: 8px 8px;
  margin: 4px 10px 0;
}
.toggle-btn {
  width: 36px; height: 36px; border: 1px solid var(--border);
  background: var(--glass); color: var(--text-dim); border-radius: 10px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; font-family: inherit;
}
.toggle-btn:hover { background: var(--toggle-hover); color: var(--text-accent); border-color: var(--border-strong); }

.main-content { flex: 1; padding: 24px 28px; min-width: 0; overflow-y: auto; position: relative; z-index: 1; }
.content-inner { max-width: 1180px; margin: 0 auto; }

/* 航图页签: 全宽 + 固定视口高度, 阅读器不随页面滚动 */
.main-content.chart-mode { display: flex; overflow: hidden; }
.content-inner.chart-inner {
  max-width: none;
  height: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 移动端航图页签恢复页面级滚动(单屏锁死会导致无法下滑) */
@media (max-width: 900px) {
  .main-content.chart-mode { display: block; overflow-y: auto; }
  .content-inner.chart-inner { height: auto; min-height: 100%; }
}

.app-footer {
  position: relative; z-index: 2;
  background: var(--glass-header);
  backdrop-filter: blur(var(--blur)); -webkit-backdrop-filter: blur(var(--blur));
  padding: 8px 24px; text-align: center; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  flex-wrap: wrap; font-size: 11px; color: var(--text-muted);
}
.app-footer a { color: var(--text-dim); text-decoration: none; }
.app-footer a:hover { color: var(--text-accent); }
.app-footer .sep { color: var(--divider); }
.app-footer .icp { color: var(--text-muted); }

@media (max-width: 768px) {
  .sidebar { width: 64px; }
  .sidebar .sidebar-head { height: 0; padding: 0; border-bottom: none; margin-bottom: 0; overflow: hidden; }
  .sidebar .side-label, .sidebar .side-dot, .sidebar .side-ext { display: none; }
  .sidebar .side-btn { justify-content: center; padding: 12px 0; gap: 0; }
  .sidebar .sidebar-foot { padding: 8px 0; }
  .sidebar.collapsed { width: 64px; }
  .main-content { padding: 16px; }
}

@media (max-width: 600px) {
  /* 顶部栏: 单行紧凑布局 */
  .app-header { height: 52px; padding: 0 10px; gap: 8px; }
  .header-left { gap: 8px; flex-shrink: 0; }
  .header-left h1 { font-size: 13px; white-space: nowrap; }
  .title-group { min-width: 0; }
  .title-sub { display: none; }
  .logo-img { width: 26px; height: 26px; }
  .header-right { gap: 6px; flex-shrink: 0; }
  /* 主站链接只留图标 */
  .ghost-link { padding: 7px; }
  .ghost-link span { display: none; }

  .app-body { flex-direction: column; }
  /* 侧边栏变顶部导航条: 图标+文字, 可横向滚动 */
  .sidebar { width: 100%; flex-direction: row; padding: 0; border-right: none; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .sidebar.collapsed { width: 100%; }
  .sidebar-head { display: none; }
  /* 折叠按钮在移动端无意义, 隐藏 */
  .sidebar-foot { display: none; }
  .side-nav { flex-direction: row; padding: 4px 6px; overflow-x: auto; scrollbar-width: none; gap: 4px; }
  .side-nav::-webkit-scrollbar { display: none; }
  /* 移动端纵向排列(图标上/文字下), 背景框方正且四周留白均匀 */
  .side-btn { flex-direction: column; white-space: nowrap; width: auto; flex: 1; padding: 8px 4px; font-size: 12px; gap: 3px; align-items: center; }
  /* 覆盖 768 断点的 display:none, 显示文字标签 */
  .sidebar .side-label { display: inline; opacity: 1; font-size: 10.5px; }
  .side-icon svg { width: 18px; height: 18px; }
  .side-btn::before { display: none; }
  .side-dot { display: none; }

  .main-content { padding: 12px; }
  .app-footer { font-size: 10px; gap: 6px; padding: 6px 12px; }
}
</style>

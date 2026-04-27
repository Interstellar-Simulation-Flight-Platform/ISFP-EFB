<template>
  <div class="route-wrapper">
    <div class="search-panel">
      <div class="airport-box">
        <div class="airport-label">起飞机场</div>
        <input
          v-model="dep"
          type="text"
          maxlength="4"
          placeholder="ZBAA"
          class="icao-input"
          @keyup.enter="search"
          ref="depInput"
        />
      </div>

      <div class="route-visual">
        <div class="route-line">
          <div class="dot dep-dot"></div>
          <div class="line-body">
            <div class="plane-icon" :class="{ flying: loading }">✈️</div>
          </div>
          <div class="dot arr-dot"></div>
        </div>
        <button class="search-btn" @click="search" :disabled="loading">
          <span v-if="!loading">查询航路</span>
          <span v-else class="loading-text">
            <span class="spinner"></span> 查询中...
          </span>
        </button>
      </div>

      <div class="airport-box">
        <div class="airport-label">落地机场</div>
        <input
          v-model="arr"
          type="text"
          maxlength="4"
          placeholder="ZSPD"
          class="icao-input"
          @keyup.enter="search"
        />
      </div>
    </div>

    <div v-if="error" class="error-box">{{ error }}</div>

    <div v-if="result" class="result-panel">
      <div class="result-header">
        <div class="result-route-label">
          <span class="result-icao">{{ result.dep }}</span>
          <span class="result-arrow">→</span>
          <span class="result-icao">{{ result.arr }}</span>
        </div>
        <div class="result-header-actions">
          <button class="copy-btn" @click="copyAirway(result.airway)">📋 复制</button>
          <a href="https://www.flyisfp.com/flight-plan" target="_blank" class="flight-plan-btn">📝 提交飞行计划</a>
        </div>
      </div>

      <div class="result-grid">
        <div class="result-col">
          <h4 class="section-title">完整航路</h4>
          <div class="route-code">{{ result.airway }}</div>
        </div>
        <div class="result-col">
          <h4 class="section-title">提交航路</h4>
          <div class="route-code highlight">{{ result.airwayHandIn }}</div>
        </div>
      </div>
    </div>

    <div v-if="!result && !loading && !error" class="empty-state">
      <img src="/logo/logo.png" alt="" class="empty-logo" @error="e => e.target.style.display='none'" />
      <p>请输入起降机场 ICAO 代码查询航路</p>
      <p class="empty-example">例如：ZBAA → ZSPD</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { fetchRoute } from '../api/index.js'

const dep = ref('')
const arr = ref('')
const loading = ref(false)
const error = ref('')
const result = ref(null)
const depInput = ref(null)

async function search() {
  error.value = ''
  result.value = null

  const depCode = dep.value.trim().toUpperCase()
  const arrCode = arr.value.trim().toUpperCase()

  if (!depCode.match(/^[A-Z]{4}$/) || !arrCode.match(/^[A-Z]{4}$/)) {
    error.value = '请输入有效的4位机场ICAO代码'
    return
  }

  if (depCode === arrCode) {
    error.value = '起飞机场和落地机场不能相同'
    return
  }

  loading.value = true
  try {
    const data = await fetchRoute(depCode, arrCode)
    if (!data) {
      error.value = `未找到 ${depCode} 到 ${arrCode} 的航路数据`
      return
    }
    result.value = data
  } catch (e) {
    error.value = `查询失败: ${e.message}`
  } finally {
    loading.value = false
  }
}

function copyAirway(text) {
  navigator.clipboard.writeText(text).catch(() => {})
}
</script>

<style scoped>
.route-wrapper {
  max-width: 960px;
  margin: 0 auto;
}

.search-panel {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px 24px;
}

.airport-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.airport-label {
  font-size: 12px;
  color: var(--text-dim);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.icao-input {
  width: 130px;
  padding: 14px 0;
  border: none;
  background: var(--bg-input);
  color: var(--text-accent);
  font-size: 28px;
  font-weight: 700;
  font-family: 'Consolas', 'Courier New', monospace;
  letter-spacing: 8px;
  text-align: center;
  border-radius: 10px;
  outline: none;
  transition: all 0.2s;
  text-transform: uppercase;
  border: 2px solid transparent;
}

.icao-input:focus {
  border-color: var(--text-accent);
  box-shadow: 0 0 20px rgba(126, 200, 255, 0.15);
}

.route-visual {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
}

.route-line {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dep-dot {
  background: var(--accent);
  box-shadow: 0 0 8px rgba(32, 128, 232, 0.5);
}

.arr-dot {
  background: var(--green);
  box-shadow: 0 0 8px rgba(74, 173, 94, 0.5);
}

.line-body {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--green));
  position: relative;
  margin: 0 4px;
}

.plane-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  transition: all 0.3s;
}

.plane-icon.flying {
  animation: flyBounce 0.6s ease-in-out infinite;
}

@keyframes flyBounce {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50% { transform: translate(-50%, -50%) translateY(-6px); }
}

.search-btn {
  padding: 10px 28px;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
  width: 100%;
}

.search-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--accent-hover), var(--accent));
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(32, 128, 232, 0.3);
}

.search-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-box {
  background: var(--red-bg);
  border: 1px solid var(--red-border);
  color: var(--red);
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 14px;
  margin-top: 16px;
}

.result-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  margin-top: 16px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-code);
}

.result-route-label {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-icao {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-accent);
  font-family: 'Consolas', 'Courier New', monospace;
  letter-spacing: 3px;
}

.result-arrow {
  font-size: 18px;
  color: var(--text-dim);
}

.result-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-btn {
  padding: 6px 16px;
  background: var(--active-bg);
  color: var(--text-accent);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.copy-btn:hover {
  background: var(--toggle-hover);
}

.flight-plan-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-family: inherit;
  font-weight: 500;
}

.flight-plan-btn:hover {
  background: linear-gradient(135deg, var(--accent-hover), var(--accent));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(32, 128, 232, 0.3);
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.result-col {
  padding: 20px 24px;
}

.result-col:first-child {
  border-right: 1px solid var(--border);
}

.section-title {
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.route-code {
  background: var(--bg-input);
  padding: 14px 18px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Consolas', 'Courier New', monospace;
  border: 1px solid var(--border-light);
}

.route-code.highlight {
  color: var(--green);
  border: 1px solid rgba(74, 173, 94, 0.2);
}

.empty-state {
  text-align: center;
  padding: 60px 0 40px;
  color: var(--text-muted);
  opacity: 0.7;
}

.empty-logo {
  width: 64px;
  height: 64px;
  opacity: 0.3;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 14px;
  margin-bottom: 6px;
}

.empty-example {
  font-size: 13px;
  color: var(--text-muted);
  font-family: 'Consolas', 'Courier New', monospace;
}

@media (max-width: 700px) {
  .search-panel {
    flex-direction: column;
    gap: 20px;
    padding: 24px 20px;
  }

  .route-visual {
    flex: 0 0 auto;
    width: 100%;
  }

  .result-grid {
    grid-template-columns: 1fr;
  }

  .result-col:first-child {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .icao-input {
    width: 100%;
    font-size: 24px;
    letter-spacing: 6px;
  }
}
</style>

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
            <span class="plane-icon" :class="{ flying: loading }"><Icon name="plane" :size="18" /></span>
          </div>
          <div class="dot arr-dot"></div>
        </div>
        <button class="search-btn" @click="search" :disabled="loading">
          <span v-if="!loading" class="btn-inner"><Icon name="search" :size="16" /> 查询航路</span>
          <span v-else class="loading-text"><span class="spinner"></span> 查询中...</span>
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

    <div v-if="error" class="error-box"><Icon name="alert" :size="16" /> {{ error }}</div>

    <div v-if="result" class="result-panel">
      <div class="result-header">
        <div class="result-route-label">
          <span class="result-icao">{{ result.dep }}</span>
          <span class="result-arrow"><Icon name="arrowRight" :size="18" /></span>
          <span class="result-icao">{{ result.arr }}</span>
        </div>
        <div class="result-header-actions">
          <button class="copy-btn" @click="copyAirway(result.airwayHandIn)"><Icon name="copy" :size="15" /> {{ copied ? '已复制' : '复制' }}</button>
          <a href="https://www.flyisfp.com/flight-plan" target="_blank" rel="noopener noreferrer" class="flight-plan-btn"><Icon name="doc" :size="15" /> 提交飞行计划</a>
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
      <span class="empty-logo"><Icon name="route" :size="48" /></span>
      <p>请输入起降机场 ICAO 代码查询航路</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { fetchRoute } from '../api/index.js'
import Icon from './Icon.vue'

const dep = ref('')
const arr = ref('')
const loading = ref(false)
const error = ref('')
const result = ref(null)
const depInput = ref(null)
const copied = ref(false)

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
  navigator.clipboard.writeText(text).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  }).catch(() => {})
}
</script>

<style scoped>
.route-wrapper { max-width: 980px; margin: 0 auto; }

.search-panel {
  display: flex; align-items: center; gap: 0;
  background: var(--glass);
  backdrop-filter: blur(var(--blur)); -webkit-backdrop-filter: blur(var(--blur));
  border: 1px solid var(--border);
  border-radius: 18px; padding: 28px 24px;
  box-shadow: var(--shadow);
}
.airport-box { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.airport-label { font-size: 11px; color: var(--text-dim); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

.icao-input {
  width: 130px; padding: 14px 0; border: none;
  background: var(--glass-input); color: var(--text-accent);
  font-size: 28px; font-weight: 700;
  font-family: 'Consolas', 'Courier New', monospace;
  letter-spacing: 8px; text-align: center; border-radius: 12px;
  outline: none; transition: all 0.2s; text-transform: uppercase;
  border: 2px solid transparent;
}
.icao-input:focus { border-color: var(--text-accent); box-shadow: 0 0 24px rgba(111, 181, 255, 0.18); }

.route-visual { flex: 0 0 220px; display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 0 12px; }
.route-line { display: flex; align-items: center; width: 100%; gap: 0; }
.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dep-dot { background: var(--accent); box-shadow: 0 0 10px rgba(58, 144, 240, 0.6); }
.arr-dot { background: var(--green); box-shadow: 0 0 10px rgba(78, 197, 116, 0.6); }
.line-body { flex: 1; height: 2px; background: linear-gradient(90deg, var(--accent), var(--green)); position: relative; margin: 0 4px; }
.plane-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-accent); transition: all 0.3s; display: flex; }
.plane-icon.flying { animation: flyBounce 0.6s ease-in-out infinite; }
@keyframes flyBounce {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50% { transform: translate(-50%, -50%) translateY(-6px); }
}

.search-btn {
  padding: 11px 28px; background: var(--accent-grad); color: #fff;
  border: none; border-radius: 11px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; font-family: inherit;
  white-space: nowrap; width: 100%;
}
.search-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(58, 144, 240, 0.35); }
.search-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-inner { display: inline-flex; align-items: center; gap: 7px; justify-content: center; }
.loading-text { display: flex; align-items: center; justify-content: center; gap: 8px; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.error-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--red-bg); border: 1px solid var(--red-border);
  color: var(--red); padding: 14px 18px; border-radius: 12px;
  font-size: 14px; margin-top: 16px;
}

.result-panel {
  background: var(--glass);
  backdrop-filter: blur(var(--blur)); -webkit-backdrop-filter: blur(var(--blur));
  border: 1px solid var(--border); border-radius: 16px;
  overflow: hidden; margin-top: 16px; box-shadow: var(--shadow);
}
.result-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid var(--border); background: var(--glass-code); }
.result-route-label { display: flex; align-items: center; gap: 12px; }
.result-icao { font-size: 18px; font-weight: 700; color: var(--text-accent); font-family: 'Consolas', 'Courier New', monospace; letter-spacing: 3px; }
.result-arrow { color: var(--text-dim); display: flex; }
.result-header-actions { display: flex; align-items: center; gap: 8px; }

.copy-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; background: var(--active-bg); color: var(--text-accent);
  border: 1px solid var(--border); border-radius: 9px;
  font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: inherit;
}
.copy-btn:hover { background: var(--toggle-hover); border-color: var(--border-strong); }

.flight-plan-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; background: var(--accent-grad); color: #fff;
  border: none; border-radius: 9px; font-size: 13px; cursor: pointer;
  transition: all 0.2s; text-decoration: none; font-family: inherit; font-weight: 500;
}
.flight-plan-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(58, 144, 240, 0.35); }

.result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.result-col { padding: 20px 24px; }
.result-col:first-child { border-right: 1px solid var(--border); }
.section-title { font-size: 11px; color: var(--text-dim); margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

.route-code {
  background: var(--glass-input); padding: 14px 18px; border-radius: 10px;
  font-size: 13px; line-height: 1.8; color: var(--text);
  white-space: pre-wrap; word-break: break-all;
  font-family: 'Consolas', 'Courier New', monospace; border: 1px solid var(--border-light);
}
.route-code.highlight { color: var(--green); border-color: var(--green-border); background: var(--green-soft); }

.empty-state { text-align: center; padding: 60px 0 40px; color: var(--text-muted); }
.empty-logo { display: inline-flex; color: var(--text-muted); opacity: 0.35; margin-bottom: 16px; }
.empty-state p { font-size: 14px; margin-bottom: 6px; }

@media (max-width: 700px) {
  .search-panel { flex-direction: column; gap: 20px; padding: 24px 20px; }
  .route-visual { flex: 0 0 auto; width: 100%; }
  .result-grid { grid-template-columns: 1fr; }
  .result-col:first-child { border-right: none; border-bottom: 1px solid var(--border); }
  .icao-input { width: 100%; font-size: 24px; letter-spacing: 6px; }
}
</style>

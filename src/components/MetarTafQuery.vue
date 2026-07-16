<template>
  <div class="feature-card">
    <div class="tab-row">
      <button :class="['tab-btn', { active: queryType === 'metar' }]" @click="queryType = 'metar'">METAR 实况</button>
      <button :class="['tab-btn', { active: queryType === 'taf' }]" @click="queryType = 'taf'">TAF 预报</button>
    </div>

    <div class="input-row">
      <div class="input-group">
        <label>机场 ICAO 代码<span v-if="queryType === 'taf'" class="hint">（TAF 支持批量，逗号分隔）</span></label>
        <input
          v-model="icao"
          type="text"
          maxlength="40"
          :placeholder="queryType === 'taf' ? '例如: ZBAA,ZSPD' : '例如: ZBAA'"
          class="input-field"
          @keyup.enter="search"
        />
      </div>
      <button class="search-btn" @click="search" :disabled="loading">
        <span v-if="!loading" class="btn-inner"><Icon name="search" :size="16" /> 查询{{ queryType === 'metar' ? 'METAR' : 'TAF' }}</span>
        <span v-else class="loading-text"><span class="spinner"></span> 查询中...</span>
      </button>
    </div>

    <div v-if="error" class="error-box"><Icon name="alert" :size="16" /> {{ error }}</div>

    <div v-if="metarResult && queryType === 'metar'" class="result-box">
      <div class="result-header">
        <span class="badge metar-badge">METAR</span>
        <span class="route-desc">{{ metarIcao }}</span>
      </div>
      <div class="result-body">
        <pre class="weather-text">{{ metarResult }}</pre>
      </div>
    </div>

    <div v-if="tafResults.length > 0 && queryType === 'taf'" class="result-box">
      <div v-for="(item, idx) in tafResults" :key="idx" class="taf-item">
        <div class="result-header">
          <span class="badge taf-badge">TAF</span>
          <span class="route-desc">{{ item.icao }}</span>
        </div>
        <div class="result-body">
          <pre v-if="item.taf" class="weather-text">{{ item.taf }}</pre>
          <p v-else class="no-data">未找到该机场的 TAF 数据</p>
        </div>
      </div>
    </div>

    <div v-if="!metarResult && tafResults.length === 0 && !loading && !error" class="empty-hint">
      <span class="empty-icon"><Icon name="weather" :size="40" /></span>
      <p>请输入机场 ICAO 代码查询气象报文</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { fetchMetar, fetchTaf } from '../api/index.js'
import Icon from './Icon.vue'

const queryType = ref('metar')
const icao = ref('')
const loading = ref(false)
const error = ref('')
const metarResult = ref('')
const metarIcao = ref('')
const tafResults = ref([])

async function search() {
  error.value = ''
  metarResult.value = ''
  metarIcao.value = ''
  tafResults.value = []

  const rawIcao = icao.value.trim().toUpperCase()
  if (!rawIcao) {
    error.value = '请输入机场ICAO代码'
    return
  }

  if (queryType.value === 'metar') {
    if (!rawIcao.match(/^[A-Z]{4}$/)) {
      error.value = '请输入有效的4位机场ICAO代码'
      return
    }
    loading.value = true
    try {
      const data = await fetchMetar(rawIcao)
      if (!data) {
        error.value = `未找到 ${rawIcao} 的METAR数据`
        return
      }
      metarResult.value = data
      metarIcao.value = rawIcao
    } catch (e) {
      error.value = `查询失败: ${e.message}`
    } finally {
      loading.value = false
    }
  } else {
    const codes = rawIcao.split(',').map(c => c.trim()).filter(Boolean)
    if (codes.length === 0) {
      error.value = '请输入机场ICAO代码'
      return
    }
    for (const code of codes) {
      if (!code.match(/^[A-Z]{4}$/)) {
        error.value = `无效的ICAO代码: ${code}`
        return
      }
    }
    loading.value = true
    try {
      const results = await fetchTaf(rawIcao)
      if (!results || results.length === 0) {
        error.value = '未找到TAF数据'
        return
      }
      tafResults.value = results
    } catch (e) {
      error.value = `查询失败: ${e.message}`
    } finally {
      loading.value = false
    }
  }
}
</script>

<style scoped>
.feature-card {
  background: var(--glass);
  backdrop-filter: blur(var(--blur)); -webkit-backdrop-filter: blur(var(--blur));
  border-radius: 18px; border: 1px solid var(--border);
  padding: 30px; box-shadow: var(--shadow);
}

.tab-row { display: flex; gap: 8px; margin-bottom: 20px; }
.tab-btn {
  padding: 10px 22px; border: 1px solid var(--border); border-radius: 10px;
  background: var(--glass-input); color: var(--text-dim); font-size: 14px;
  cursor: pointer; transition: all 0.2s; font-family: inherit;
}
.tab-btn:hover { border-color: var(--text-accent); color: var(--text); }
.tab-btn.active { background: var(--active-bg); border-color: var(--text-accent); color: var(--text-accent); }

.input-row { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.input-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 220px; }
.input-group label { font-size: 13px; color: var(--text-dim); font-weight: 500; }
.hint { font-size: 11px; color: var(--text-muted); margin-left: 4px; }

.input-field {
  padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px;
  background: var(--glass-input); color: var(--text); font-size: 18px;
  font-family: 'Consolas', 'Courier New', monospace; letter-spacing: 3px;
  width: 100%; outline: none; transition: border-color 0.2s; text-transform: uppercase;
}
.input-field:focus { border-color: var(--text-accent); box-shadow: 0 0 0 3px rgba(111, 181, 255, 0.14); }

.search-btn {
  padding: 12px 26px; background: var(--accent-grad); color: #fff;
  border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap;
}
.search-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(58, 144, 240, 0.35); }
.search-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-inner { display: inline-flex; align-items: center; gap: 7px; justify-content: center; }
.loading-text { display: flex; align-items: center; justify-content: center; gap: 8px; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.error-box { display: flex; align-items: center; gap: 8px; background: var(--red-bg); border: 1px solid var(--red-border); color: var(--red); padding: 14px 18px; border-radius: 10px; font-size: 14px; }

.result-box { background: var(--glass-input); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.result-header { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-bottom: 1px solid var(--border); background: var(--glass-code); }
.badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
.metar-badge { background: var(--accent-grad); }
.taf-badge { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
.route-desc { font-size: 16px; color: var(--text-accent); font-weight: 600; font-family: 'Consolas', 'Courier New', monospace; letter-spacing: 2px; }
.result-body { padding: 18px 20px; }
.weather-text { font-size: 14px; line-height: 1.8; color: var(--text); white-space: pre-wrap; word-break: break-all; font-family: 'Consolas', 'Courier New', monospace; background: var(--glass-code); padding: 16px 18px; border-radius: 8px; }
.taf-item + .taf-item { border-top: 1px solid var(--border); }
.no-data { color: var(--text-dim); font-size: 14px; text-align: center; padding: 16px 0; }

.empty-hint { text-align: center; padding: 40px 0; color: var(--text-muted); font-size: 14px; }
.empty-icon { display: inline-flex; color: var(--text-muted); opacity: 0.35; margin-bottom: 10px; }

@media (max-width: 600px) {
  .feature-card { padding: 20px; }
  .input-field { font-size: 16px; letter-spacing: 2px; }
  .search-btn { width: 100%; }
}
</style>

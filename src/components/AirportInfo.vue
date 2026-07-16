<template>
  <div class="feature-card">
    <div class="input-row">
      <div class="input-group">
        <label>机场 ICAO 代码</label>
        <input
          v-model="icao"
          type="text"
          maxlength="4"
          placeholder="例如: ZBAA"
          class="input-field"
          @keyup.enter="search"
        />
      </div>
      <button class="search-btn" @click="search" :disabled="loading">
        <span v-if="!loading" class="btn-inner"><Icon name="search" :size="16" /> 查询机场</span>
        <span v-else class="loading-text"><span class="spinner"></span> 查询中...</span>
      </button>
    </div>

    <div v-if="error" class="error-box"><Icon name="alert" :size="16" /> {{ error }}</div>

    <div v-if="result" class="result-box">
      <div class="airport-header">
        <div class="airport-name">{{ result.name }}</div>
        <div class="airport-icao">{{ result.icao }}</div>
      </div>

      <div class="info-grid">
        <div class="info-item"><span class="info-label">ICAO代码</span><span class="info-value code">{{ result.icao }}</span></div>
        <div class="info-item"><span class="info-label">IATA代码</span><span class="info-value code">{{ result.iata || '-' }}</span></div>
        <div class="info-item"><span class="info-label">机场名称</span><span class="info-value">{{ result.name }}</span></div>
        <div class="info-item"><span class="info-label">所在城市</span><span class="info-value">{{ result.city || '-' }}</span></div>
        <div class="info-item"><span class="info-label">州/省</span><span class="info-value">{{ result.state || '-' }}</span></div>
        <div class="info-item"><span class="info-label">国家</span><span class="info-value">{{ result.countryName || result.country || '-' }}</span></div>
        <div class="info-item"><span class="info-label">标高</span><span class="info-value">{{ result.elevation !== undefined ? result.elevation + ' ft' : '-' }}</span></div>
        <div class="info-item"><span class="info-label">纬度</span><span class="info-value mono">{{ formatCoord(result.lat) }}</span></div>
        <div class="info-item"><span class="info-label">经度</span><span class="info-value mono">{{ formatCoord(result.lon) }}</span></div>
        <div class="info-item"><span class="info-label">时区</span><span class="info-value">{{ result.timezoneDisplay || result.tz || '-' }}</span></div>
        <div class="info-item"><span class="info-label">时区ID</span><span class="info-value mono">{{ result.tz || '-' }}</span></div>
      </div>
    </div>

    <div v-if="!result && !loading && !error" class="empty-hint">
      <span class="empty-icon"><Icon name="airport" :size="40" /></span>
      <p>请输入4位机场 ICAO 代码查询机场信息，例如 ZBAA、ZSPD、KJFK 等</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { loadAirportData, loadTimezoneTranslations, loadCountryNames } from '../api/index.js'
import Icon from './Icon.vue'

const icao = ref('')
const loading = ref(false)
const error = ref('')
const result = ref(null)

let airportsData = null
let timezoneTranslations = {}
let countryNames = {}

async function initData() {
  try {
    const [airports, tz, countries] = await Promise.all([
      loadAirportData(),
      loadTimezoneTranslations(),
      loadCountryNames(),
    ])
    airportsData = airports
    timezoneTranslations = tz
    countryNames = countries
  } catch (e) {
    error.value = `机场数据加载失败: ${e.message}`
  }
}

initData()

function formatCoord(val) {
  if (val === undefined || val === null) return '-'
  return val.toFixed(6) + '°'
}

function search() {
  error.value = ''
  result.value = null

  const code = icao.value.trim().toUpperCase()
  if (!code.match(/^[A-Z]{4}$/)) {
    error.value = '请输入有效的4位机场ICAO代码'
    return
  }

  if (!airportsData) {
    error.value = '机场数据尚未加载完成，请稍候'
    return
  }

  const airport = airportsData[code]
  if (!airport) {
    error.value = `未找到机场 ${code} 的信息`
    return
  }

  result.value = {
    ...airport,
    countryName: countryNames[airport.country] || null,
    timezoneDisplay: timezoneTranslations[airport.tz] || null,
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

.input-row { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.input-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 220px; }
.input-group label { font-size: 13px; color: var(--text-dim); font-weight: 500; }
.input-field {
  padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px;
  background: var(--glass-input); color: var(--text); font-size: 18px;
  font-family: 'Consolas', 'Courier New', monospace; letter-spacing: 4px;
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
.airport-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); background: var(--glass-code); }
.airport-name { font-size: 18px; font-weight: 600; color: var(--text); }
.airport-icao { font-size: 22px; font-weight: 700; color: var(--text-accent); font-family: 'Consolas', 'Courier New', monospace; letter-spacing: 3px; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1px; background: var(--border); }
.info-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: var(--glass-input); gap: 12px; }
.info-label { font-size: 13px; color: var(--text-dim); white-space: nowrap; font-weight: 500; }
.info-value { font-size: 14px; color: var(--text); text-align: right; word-break: break-all; }
.info-value.code { font-family: 'Consolas', 'Courier New', monospace; letter-spacing: 1px; color: var(--text-accent); }
.info-value.mono { font-family: 'Consolas', 'Courier New', monospace; font-size: 13px; }

.empty-hint { text-align: center; padding: 40px 0; color: var(--text-muted); font-size: 14px; }
.empty-icon { display: inline-flex; color: var(--text-muted); opacity: 0.35; margin-bottom: 10px; }

@media (max-width: 600px) {
  .feature-card { padding: 20px; }
  .info-grid { grid-template-columns: 1fr; }
  .input-field { font-size: 16px; letter-spacing: 2px; }
  .search-btn { width: 100%; }
  .airport-header { flex-direction: column; align-items: flex-start; gap: 6px; }
}
</style>

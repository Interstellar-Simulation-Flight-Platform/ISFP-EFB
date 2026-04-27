<template>
  <div class="feature-card">
    <div class="card-header">
      <h2>📍 机场信息查询</h2>
      <p>输入机场ICAO代码，获取机场基本信息</p>
    </div>

    <div class="input-row">
      <div class="input-group">
        <label>机场ICAO代码</label>
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
        {{ loading ? '查询中...' : '查询机场' }}
      </button>
    </div>

    <div v-if="error" class="error-box">{{ error }}</div>

    <div v-if="result" class="result-box">
      <div class="airport-header">
        <div class="airport-name">{{ result.name }}</div>
        <div class="airport-icao">{{ result.icao }}</div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">ICAO代码</span>
          <span class="info-value code">{{ result.icao }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">IATA代码</span>
          <span class="info-value code">{{ result.iata || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">机场名称</span>
          <span class="info-value">{{ result.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">所在城市</span>
          <span class="info-value">{{ result.city || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">州/省</span>
          <span class="info-value">{{ result.state || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">国家</span>
          <span class="info-value">{{ result.countryName || result.country || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">标高</span>
          <span class="info-value">{{ result.elevation !== undefined ? result.elevation + ' ft' : '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">纬度</span>
          <span class="info-value mono">{{ formatCoord(result.lat) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">经度</span>
          <span class="info-value mono">{{ formatCoord(result.lon) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">时区</span>
          <span class="info-value">{{ result.timezoneDisplay || result.tz || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">时区ID</span>
          <span class="info-value mono">{{ result.tz || '—' }}</span>
        </div>
      </div>
    </div>

    <div v-if="!result && !loading && !error" class="empty-hint">
      <p>请输入4位机场ICAO代码查询机场信息，例如 ZBAA、ZSPD、KJFK 等</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { loadAirportData, loadTimezoneTranslations, loadCountryNames } from '../api/index.js'

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
  if (val === undefined || val === null) return '—'
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
  background: var(--bg-surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 32px;
}

.card-header {
  margin-bottom: 24px;
}

.card-header h2 {
  font-size: 22px;
  color: var(--text-accent);
  margin-bottom: 6px;
}

.card-header p {
  font-size: 14px;
  color: var(--text-dim);
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 200px;
}

.input-group label {
  font-size: 13px;
  color: var(--text-dim);
  font-weight: 500;
}

.input-field {
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-input);
  color: var(--text);
  font-size: 18px;
  font-family: 'Consolas', 'Courier New', monospace;
  letter-spacing: 4px;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
  text-transform: uppercase;
}

.input-field:focus {
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(126, 200, 255, 0.1);
}

.search-btn {
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--accent-hover), var(--accent));
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-box {
  background: var(--red-bg);
  border: 1px solid var(--red-border);
  color: var(--red);
  padding: 14px 18px;
  border-radius: 8px;
  font-size: 14px;
}

.result-box {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.airport-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-code);
}

.airport-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.airport-icao {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-accent);
  font-family: 'Consolas', 'Courier New', monospace;
  letter-spacing: 3px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1px;
  background: var(--border);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: var(--bg-input);
  gap: 12px;
}

.info-label {
  font-size: 13px;
  color: var(--text-dim);
  white-space: nowrap;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: var(--text);
  text-align: right;
  word-break: break-all;
}

.info-value.code {
  font-family: 'Consolas', 'Courier New', monospace;
  letter-spacing: 1px;
  color: var(--text-accent);
}

.info-value.mono {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
}

.empty-hint {
  text-align: center;
  padding: 40px 0;
  color: var(--text-muted);
  font-size: 14px;
}

@media (max-width: 600px) {
  .feature-card {
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .input-field {
    font-size: 16px;
    letter-spacing: 2px;
  }

  .search-btn {
    width: 100%;
  }

  .airport-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>

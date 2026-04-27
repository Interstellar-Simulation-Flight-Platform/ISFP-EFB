<template>
  <div class="feature-card">
    <div class="card-header">
      <h2>🌤️ 气象报文查询</h2>
      <p>查询机场METAR实况报文和TAF预报报文</p>
    </div>

    <div class="tab-row">
      <button
        :class="['tab-btn', { active: queryType === 'metar' }]"
        @click="queryType = 'metar'"
      >METAR 实况</button>
      <button
        :class="['tab-btn', { active: queryType === 'taf' }]"
        @click="queryType = 'taf'"
      >TAF 预报</button>
    </div>

    <div class="input-row">
      <div class="input-group">
        <label>机场ICAO代码</label>
        <input
          v-model="icao"
          type="text"
          maxlength="4"
          :placeholder="queryType === 'taf' ? '例如: ZBAA' : '例如: ZBAA'"
          class="input-field"
          @keyup.enter="search"
        />
      </div>
      <button class="search-btn" @click="search" :disabled="loading">
        {{ loading ? '查询中...' : `查询${queryType === 'metar' ? 'METAR' : 'TAF'}` }}
      </button>
    </div>

    <div v-if="error" class="error-box">{{ error }}</div>

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
          <p v-else class="no-data">未找到该机场的TAF数据</p>
        </div>
      </div>
    </div>

    <div v-if="!metarResult && tafResults.length === 0 && !loading && !error" class="empty-hint">
      <p>请输入机场ICAO代码查询气象报文</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { fetchMetar, fetchTaf } from '../api/index.js'

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

.tab-row {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 10px 24px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-dim);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.tab-btn:hover {
  border-color: var(--text-accent);
  color: var(--text);
}

.tab-btn.active {
  background: var(--active-bg);
  border-color: var(--text-accent);
  color: var(--text-accent);
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
  letter-spacing: 3px;
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

.result-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-code);
}

.badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.metar-badge {
  background: var(--accent);
}

.taf-badge {
  background: #9b59b6;
}

.route-desc {
  font-size: 16px;
  color: var(--text-accent);
  font-weight: 600;
  font-family: 'Consolas', 'Courier New', monospace;
  letter-spacing: 2px;
}

.result-body {
  padding: 20px;
}

.weather-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Consolas', 'Courier New', monospace;
  background: var(--bg-code);
  padding: 16px 20px;
  border-radius: 6px;
}

.taf-item + .taf-item {
  border-top: 1px solid var(--border);
}

.no-data {
  color: var(--text-dim);
  font-size: 14px;
  text-align: center;
  padding: 16px 0;
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

  .input-field {
    font-size: 16px;
    letter-spacing: 2px;
  }

  .search-btn {
    width: 100%;
  }
}
</style>

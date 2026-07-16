<template>
  <div class="feature-card">
    <div class="refresh-row">
      <button class="refresh-btn" @click="fetchStatus" :disabled="loading">
        <span v-if="!loading" class="btn-inner"><Icon name="refresh" :size="15" /> 刷新数据</span>
        <span v-else class="loading-text"><span class="spinner"></span> 刷新中...</span>
      </button>
      <span v-if="lastUpdate" class="update-time">上次更新: {{ lastUpdate }}</span>
    </div>

    <div v-if="error" class="error-box"><Icon name="alert" :size="16" /> {{ error }}</div>

    <div v-if="data" class="status-section">
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-icon accent"><Icon name="monitor" :size="22" /></span>
          <div class="stat-value">{{ data.general?.connected_clients ?? '-' }}</div>
          <div class="stat-label">已连接客户端</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon green"><Icon name="plane" :size="22" /></span>
          <div class="stat-value">{{ data.general?.online_pilot ?? '-' }}</div>
          <div class="stat-label">在线飞行员</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon purple"><Icon name="headset" :size="22" /></span>
          <div class="stat-value">{{ data.general?.online_controller ?? '-' }}</div>
          <div class="stat-label">在线管制员</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon orange"><Icon name="clock" :size="22" /></span>
          <div class="stat-value time">{{ formattedTime }}</div>
          <div class="stat-label">数据时间</div>
        </div>
      </div>

      <div class="section-title"><Icon name="plane" :size="17" /> 在线飞行员 ({{ pilots.length }})</div>
      <div v-if="pilots.length === 0" class="empty-mini">暂无在线飞行员</div>
      <div v-else class="pilot-cards">
        <div v-for="pilot in pilots" :key="pilot.cid" class="pilot-card">
          <div class="pilot-card-header">
            <div class="pilot-ident">
              <span class="pilot-callsign">{{ pilot.callsign }}</span>
              <span class="pilot-name">{{ pilot.real_name }}</span>
            </div>
          </div>

          <div class="pilot-flight-row">
            <div class="flight-item"><span class="flight-label">地速</span><span class="flight-value">{{ pilot.ground_speed !== undefined ? pilot.ground_speed + ' kt' : '-' }}</span></div>
            <div class="flight-item"><span class="flight-label">高度</span><span class="flight-value">{{ pilot.altitude !== undefined ? pilot.altitude + ' ft' : '-' }}</span></div>
            <div class="flight-item"><span class="flight-label">应答机</span><span class="flight-value code">{{ pilot.transponder || '-' }}</span></div>
            <div class="flight-item"><span class="flight-label">航向</span><span class="flight-value">{{ pilot.heading !== undefined ? pilot.heading + '°' : '-' }}</span></div>
          </div>

          <div v-if="pilot.flight_plan" class="flight-plan-card">
            <div class="fp-header">
              <span class="fp-route-big">{{ pilot.flight_plan.departure || '-' }} -> {{ pilot.flight_plan.arrival || '-' }}</span>
            </div>
            <div class="fp-grid">
              <div class="fp-item"><span class="fp-label">机型</span><span class="fp-value">{{ pilot.flight_plan.aircraft || '-' }}</span></div>
              <div class="fp-item"><span class="fp-label">飞行规则</span><span class="fp-value">{{ pilot.flight_plan.flight_rules || '-' }}</span></div>
              <div class="fp-item"><span class="fp-label">巡航高度</span><span class="fp-value">{{ pilot.flight_plan.altitude || '-' }}</span></div>
              <div class="fp-item"><span class="fp-label">巡航真空速</span><span class="fp-value">{{ pilot.flight_plan.cruise_tas ? pilot.flight_plan.cruise_tas + ' kt' : '-' }}</span></div>
              <div class="fp-item"><span class="fp-label">航路耗时</span><span class="fp-value">{{ formatDuration(pilot.flight_plan.route_time_hour, pilot.flight_plan.route_time_minute) }}</span></div>
              <div class="fp-item"><span class="fp-label">备降场</span><span class="fp-value">{{ pilot.flight_plan.alternate || '-' }}</span></div>
              <div class="fp-item"><span class="fp-label">预计离场</span><span class="fp-value">{{ formatDepTime(pilot.flight_plan.departure_time) }}</span></div>
              <div class="fp-item"><span class="fp-label">燃油耗时</span><span class="fp-value">{{ formatDuration(pilot.flight_plan.fuel_time_hour, pilot.flight_plan.fuel_time_minute) }}</span></div>
            </div>
            <div v-if="pilot.flight_plan.route" class="fp-route">
              <span class="fp-label">航路</span>
              <span class="fp-route-text">{{ pilot.flight_plan.route }}</span>
            </div>
            <div v-if="pilot.flight_plan.remarks" class="fp-remarks">
              <span class="fp-label">备注</span>
              <span class="fp-remarks-text">{{ pilot.flight_plan.remarks }}</span>
            </div>
          </div>
          <div v-else class="no-fp">无飞行计划</div>
        </div>
      </div>

      <div class="section-title atc-title"><Icon name="headset" :size="17" /> 在线管制员 ({{ controllers.length }})</div>
      <div v-if="controllers.length === 0" class="empty-mini">暂无在线管制员</div>
      <div v-else class="list-card atc-list">
        <div class="list-scroll">
          <div v-for="(atc, idx) in controllers" :key="atc.cid" class="list-item">
            <div class="item-main">
              <span class="item-index">{{ idx + 1 }}</span>
              <span class="item-callsign">{{ atc.callsign }}</span>
              <span v-if="atc.frequency" class="item-freq">{{ (atc.frequency / 1000).toFixed(3) }} MHz</span>
            </div>
            <div class="item-detail">
              <span>{{ getFacilityName(atc.facility) }}</span>
              <span v-if="atc.is_break" class="tag-break">离开</span>
              <span v-if="atc.audio_online" class="tag-audio">语音在线</span>
              <span v-if="atc.logon_time" class="item-login">上线: {{ formatLogonTime(atc.logon_time) }}</span>
            </div>
            <div v-if="atc.atc_info && atc.atc_info.length > 0" class="atc-info">
              ATC-INFO: {{ atc.atc_info.join(', ') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!data && !loading && !error" class="empty-hint">
      <span class="empty-icon"><Icon name="users" :size="40" /></span>
      <p>点击"刷新数据"获取当前在线状态</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { fetchOnlineStatus } from '../api/index.js'
import Icon from './Icon.vue'

const loading = ref(false)
const error = ref('')
const data = ref(null)
const lastUpdate = ref('')

const pilots = computed(() => data.value?.pilots || [])
const controllers = computed(() => data.value?.controllers || [])

const formattedTime = computed(() => {
  if (!data.value?.general?.generate_time) return '-'
  try {
    const d = new Date(data.value.general.generate_time)
    return d.toLocaleString('zh-CN')
  } catch {
    return data.value.general.generate_time
  }
})

const FACILITY_NAMES = {
  0: 'OBS', 1: '飞服', 2: '放行', 3: '地面',
  4: '塔台', 5: '进近', 6: '区域',
}

function getFacilityName(id) {
  return FACILITY_NAMES[id] || `席位${id}`
}

function formatLogonTime(timeStr) {
  if (!timeStr) return ''
  try {
    const d = new Date(timeStr)
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatDuration(h, m) {
  const hour = parseInt(h) || 0
  const min = parseInt(m) || 0
  if (hour === 0 && min === 0) return '-'
  let result = ''
  if (hour > 0) result += hour + '时'
  if (min > 0) result += min + '分'
  return result || '-'
}

function formatDepTime(t) {
  if (t === undefined || t === null) return '-'
  const s = String(t)
  if (s.length === 4) return s.slice(0, 2) + ':' + s.slice(2) + 'Z'
  return s
}

async function fetchStatus() {
  error.value = ''
  loading.value = true
  try {
    const result = await fetchOnlineStatus()
    data.value = result
    lastUpdate.value = new Date().toLocaleString('zh-CN')
  } catch (e) {
    error.value = `获取在线状态失败: ${e.message}`
  } finally {
    loading.value = false
  }
}

let pollTimer = null

onMounted(() => {
  pollTimer = setInterval(() => {
    if (!loading.value) fetchStatus()
  }, 30000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

fetchStatus()
</script>

<style scoped>
.feature-card {
  background: var(--glass);
  backdrop-filter: blur(var(--blur)); -webkit-backdrop-filter: blur(var(--blur));
  border-radius: 18px; border: 1px solid var(--border);
  padding: 30px; box-shadow: var(--shadow);
}
.refresh-row { display: flex; align-items: center; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.refresh-btn {
  padding: 10px 22px; background: var(--glass-input); color: var(--text-accent);
  border: 1px solid var(--border); border-radius: 10px; font-size: 14px;
  cursor: pointer; transition: all 0.2s; font-family: inherit;
  display: inline-flex; align-items: center;
}
.refresh-btn:hover:not(:disabled) { border-color: var(--text-accent); background: var(--active-bg); }
.refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-inner { display: inline-flex; align-items: center; gap: 7px; }
.loading-text { display: flex; align-items: center; justify-content: center; gap: 8px; }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: currentColor; border-radius: 50%; animation: spin 0.6s linear infinite; }
.refresh-btn .spinner { border-color: var(--border-strong); border-top-color: var(--text-accent); }
@keyframes spin { to { transform: rotate(360deg); } }
.update-time { font-size: 13px; color: var(--text-muted); }

.error-box { display: flex; align-items: center; gap: 8px; background: var(--red-bg); border: 1px solid var(--red-border); color: var(--red); padding: 14px 18px; border-radius: 10px; font-size: 14px; margin-bottom: 20px; }

.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px; }
.stat-card { background: var(--glass-input); border: 1px solid var(--border); border-radius: 14px; padding: 18px 16px; text-align: center; }
.stat-icon { display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.stat-icon.accent { color: var(--text-accent); }
.stat-icon.green { color: var(--green); }
.stat-icon.purple { color: var(--purple); }
.stat-icon.orange { color: var(--orange); }
.stat-value { font-size: 28px; font-weight: 700; color: var(--text-accent); font-family: 'Consolas', 'Courier New', monospace; }
.stat-value.time { font-size: 14px; color: var(--text-dim); font-weight: 400; }
.stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

.section-title {
  font-size: 15px; color: var(--text); padding: 13px 18px; margin-bottom: 12px;
  background: var(--glass-code); border: 1px solid var(--border); border-radius: 12px;
  display: flex; align-items: center; gap: 8px; font-weight: 600;
}
.atc-title { margin-top: 24px; }
.pilot-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 12px; margin-bottom: 4px; }
.pilot-card { background: var(--glass-input); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: all 0.2s; }
.pilot-card:hover { border-color: var(--text-accent); box-shadow: var(--shadow-sm); }
.pilot-card-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--glass-code); border-bottom: 1px solid var(--border); }
.pilot-ident { display: flex; flex-direction: column; gap: 2px; }
.pilot-callsign { font-size: 15px; font-weight: 700; color: var(--text-accent); font-family: 'Consolas', 'Courier New', monospace; }
.pilot-name { font-size: 12px; color: var(--text-dim); }

.pilot-flight-row { display: flex; justify-content: space-around; padding: 11px 16px; border-bottom: 1px solid var(--border-light); }
.flight-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.flight-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.flight-value { font-size: 14px; font-weight: 600; color: var(--text); font-family: 'Consolas', 'Courier New', monospace; }
.flight-value.code { color: var(--text-accent); }

.flight-plan-card { padding: 12px 16px; }
.fp-header { margin-bottom: 10px; }
.fp-route-big { font-size: 15px; font-weight: 700; color: var(--text-accent); font-family: 'Consolas', 'Courier New', monospace; letter-spacing: 1px; }
.fp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; margin-bottom: 8px; }
.fp-item { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }
.fp-label { font-size: 11px; color: var(--text-muted); }
.fp-value { font-size: 12px; color: var(--text); font-family: 'Consolas', 'Courier New', monospace; font-weight: 500; }

.fp-route { display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px; }
.fp-route-text { font-size: 12px; color: var(--green); font-family: 'Consolas', 'Courier New', monospace; background: var(--green-soft); padding: 8px 10px; border-radius: 6px; word-break: break-all; line-height: 1.6; }
.fp-remarks { display: flex; flex-direction: column; gap: 4px; }
.fp-remarks-text { font-size: 12px; color: var(--text-dim); font-family: 'Consolas', 'Courier New', monospace; background: var(--hover-bg); padding: 8px 10px; border-radius: 6px; word-break: break-all; line-height: 1.6; }
.no-fp { padding: 16px; text-align: center; font-size: 12px; color: var(--text-muted); }

.atc-list { background: var(--glass-input); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.list-scroll { max-height: 320px; overflow-y: auto; }
.list-item { padding: 12px 18px; border-bottom: 1px solid var(--border-light); transition: background 0.15s; }
.list-item:hover { background: var(--hover-bg); }
.list-item:last-child { border-bottom: none; }

.item-main { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.item-index { font-size: 12px; color: var(--text-muted); min-width: 20px; }
.item-callsign { font-size: 15px; font-weight: 600; color: var(--text); font-family: 'Consolas', 'Courier New', monospace; }
.item-freq { font-size: 13px; color: var(--green); font-family: 'Consolas', 'Courier New', monospace; margin-left: auto; }
.item-detail { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: var(--text-dim); padding-left: 30px; }
.item-login { color: var(--text-dim); }
.tag-break { background: var(--orange-soft); color: var(--orange); padding: 1px 8px; border-radius: 4px; font-size: 11px; }
.tag-audio { background: var(--green-soft); color: var(--green); padding: 1px 8px; border-radius: 4px; font-size: 11px; }
.atc-info { margin-top: 6px; padding-left: 30px; font-size: 12px; color: var(--text-accent); font-family: 'Consolas', 'Courier New', monospace; word-break: break-all; }

.empty-mini { text-align: center; padding: 30px 0; color: var(--text-muted); font-size: 14px; }
.empty-hint { text-align: center; padding: 40px 0; color: var(--text-muted); font-size: 14px; }
.empty-icon { display: inline-flex; color: var(--text-muted); opacity: 0.35; margin-bottom: 10px; }

@media (max-width: 768px) {
  .feature-card { padding: 20px; }
  .pilot-cards { grid-template-columns: 1fr; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .list-scroll { max-height: 250px; }
}
</style>

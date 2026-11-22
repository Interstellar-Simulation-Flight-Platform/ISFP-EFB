<template>
  <div class="chart-query">
    <div class="chart-toolbar">
      <div class="chart-title">
        <Icon name="map" :size="18" />
        <span class="chart-title-text">航图查询</span>
        <span v-if="versionInfo" class="chart-version">
          周期 {{ versionInfo.dataVersion }} · 生效 {{ versionInfo.effectiveShow.slice(0, 10) }}
        </span>
      </div>
    </div>

    <div v-if="error" class="chart-error">
      <Icon name="alert" :size="16" />
      <span>{{ error }}</span>
      <button class="chart-retry" @click="loadAll">重试</button>
    </div>

    <div v-else class="chart-layout">
      <!-- 左栏: 模式切换 + 列表 -->
      <aside class="chart-side">
        <div class="chart-tabs">
          <button :class="['chart-tab', { active: mode === 'airport' }]" @click="switchMode('airport')">机场图</button>
          <button :class="['chart-tab', { active: mode === 'enroute' }]" @click="switchMode('enroute')">航路图</button>
          <button :class="['chart-tab', { active: mode === 'docs' }]" @click="switchMode('docs')">AIP 文档</button>
        </div>

        <template v-if="mode === 'airport'">
          <div v-if="!selectedAirport" class="chart-search">
            <input v-model="airportSearch" type="text" class="chart-search-input"
                   placeholder="搜索机场 ICAO / 名称" />
          </div>
          <div v-else class="airport-head">
            <button class="airport-back" @click="selectedAirport = null">
              <Icon name="chevronLeft" :size="14" /> 机场列表
            </button>
            <span class="airport-title">
              <span class="row-icao">{{ selectedAirport.icao }}</span>
              {{ selectedAirport.nameCn }}
            </span>
          </div>

          <div class="chart-list">
            <template v-if="!selectedAirport">
              <p v-if="filteredAirports.length === 0" class="chart-empty">没有匹配的机场</p>
              <button v-for="ap in filteredAirports" :key="ap.icao" class="chart-row"
                      @click="selectAirport(ap)">
                <span class="row-icon"><Icon name="airport" :size="14" /></span>
                <span class="row-body">
                  <span class="row-name">{{ ap.nameCn }}</span>
                </span>
                <span class="row-icao">{{ ap.icao }}</span>
              </button>
            </template>
            <template v-else>
              <button v-if="airportAdFile" class="chart-row"
                      :class="{ selected: currentDoc && currentDoc.id === airportAdFile.id }"
                      @click="selectNode(airportAdFile)">
                <span class="row-icon"><Icon name="doc" :size="14" /></span>
                <span class="row-body"><span class="row-name">{{ nodeName(airportAdFile) }}</span></span>
              </button>
              <template v-for="group in airportGroups" :key="group.label">
                <p class="group-label">{{ group.label }}<span class="group-count">{{ group.items.length }}</span></p>
                <button v-for="item in group.items" :key="item.node.id" class="chart-row"
                        :class="{ selected: currentDoc && currentDoc.id === item.node.id }"
                        @click="selectNode(item.node)">
                  <span class="row-icon"><Icon name="doc" :size="14" /></span>
                  <span class="row-body"><span class="row-name">{{ nodeName(item.node) }}</span></span>
                </button>
              </template>
              <p v-if="airportGroups.length === 0 && !airportAdFile" class="chart-empty">该机场没有可用航图</p>
            </template>
          </div>
        </template>

        <template v-else-if="mode === 'enroute'">
          <div class="chart-search">
            <input v-model="docSearch" type="text" class="chart-search-input" placeholder="搜索航路图" />
          </div>
          <div class="chart-list">
            <template v-for="group in enrouteGroups" :key="group.label">
              <p class="group-label">{{ group.label }}<span class="group-count">{{ group.items.length }}</span></p>
              <button v-for="item in group.items" :key="item.node.id" class="chart-row"
                      :class="{ selected: currentDoc && currentDoc.id === item.node.id }"
                      @click="selectNode(item.node)">
                <span class="row-icon"><Icon name="doc" :size="14" /></span>
                <span class="row-body"><span class="row-name">{{ nodeName(item.node) }}</span></span>
              </button>
            </template>
            <p v-if="enrouteGroups.length === 0" class="chart-empty">没有匹配的航路图</p>
          </div>
        </template>

        <template v-else>
          <div class="chart-tabs sub-tabs">
            <button v-for="sec in docSections" :key="sec"
                    :class="['chart-tab', { active: docSection === sec }]"
                    @click="docSection = sec">{{ secLabel(sec) }}</button>
          </div>
          <div class="chart-search">
            <input v-model="docSearch" type="text" class="chart-search-input"
                   :placeholder="`搜索${secLabel(docSection)}文档`" />
          </div>
          <div class="chart-list">
            <template v-if="isTreeSection">
              <template v-if="docSearch.trim()">
                <p v-if="filteredDocResults.length === 0" class="chart-empty">没有匹配的文档</p>
                <button v-for="node in filteredDocResults" :key="node.id" class="chart-row"
                        :class="{ selected: currentDoc && currentDoc.id === node.id }"
                        @click="selectNode(node)">
                  <span class="row-icon"><Icon name="doc" :size="14" /></span>
                  <span class="row-body"><span class="row-name">{{ nodeName(node) }}</span></span>
                </button>
              </template>
              <template v-else>
                <button v-for="row in visibleRows" :key="row.node.id" class="chart-row"
                        :class="{ selected: currentDoc && currentDoc.id === row.node.id, folder: !row.node.pdfPath }"
                        :style="{ paddingLeft: 8 + row.depth * 14 + 'px' }"
                        @click="onRowClick(row.node)">
                  <span class="row-toggle" :class="{ expanded: expanded.has(row.node.id) }">
                    <Icon v-if="!row.node.pdfPath && row.node.children.length" name="chevronRight" :size="13" />
                  </span>
                  <span class="row-icon"><Icon :name="row.node.pdfPath ? 'doc' : 'tower'" :size="14" /></span>
                  <span class="row-body"><span class="row-name">{{ nodeName(row.node) }}</span></span>
                </button>
              </template>
            </template>
            <template v-else>
              <p v-if="flatDocs.length === 0" class="chart-empty">本章节没有文档</p>
              <button v-for="doc in filteredFlatDocs" :key="doc.id" class="chart-row"
                      :class="{ selected: currentDoc && currentDoc.id === doc.id }"
                      @click="selectFlatDoc(doc)">
                <span class="row-icon"><Icon name="doc" :size="14" /></span>
                <span class="row-body">
                  <span class="row-name">{{ doc.nameCn }}</span>
                  <span v-if="doc.serial" class="row-crumbs">{{ doc.serial }}</span>
                </span>
              </button>
            </template>
          </div>
        </template>
      </aside>

      <!-- 右栏: PDF 阅读器 -->
      <section class="chart-viewer">
        <div class="viewer-head">
          <span class="viewer-name">{{ currentDoc ? currentDoc.title : '未选择文档' }}</span>
          <a v-if="currentDoc" :href="currentDoc.src" target="_blank" rel="noopener noreferrer"
             class="viewer-open" title="在新窗口打开">
            <Icon name="arrowRight" :size="14" />
          </a>
        </div>
        <div class="viewer-body">
          <div v-if="!currentDoc" class="viewer-placeholder">
            <span class="placeholder-icon"><Icon name="map" :size="44" /></span>
            <p>请在左侧选择航图</p>
            <p class="placeholder-sub">数据来源 eaip.flyisfp.com</p>
          </div>
          <div v-else class="viewer-frame-box">
            <div v-if="pdfLoading" class="viewer-loading"><span class="spinner"></span> 加载 PDF...</div>
            <div v-else-if="pdfError" class="viewer-error">
              <Icon name="alert" :size="16" />
              <span>{{ pdfError }}</span>
              <button class="viewer-retry" @click="retryPdf">重试</button>
            </div>
            <iframe v-else-if="currentDoc.src" :src="currentDoc.src" class="viewer-frame"
                    :title="currentDoc.title"></iframe>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  fetchEaipVersion,
  fetchEaipAllSections,
  parseAdSection,
  parseEnrSection,
  parseFlatSection,
  parseNotamSection,
  parseAmdtSection,
  buildSectionTree,
  resolveEaipUrl,
  eaipSectionLabel,
  CHART_TYPE_LABELS,
  ENROUTE_TYPE_LABELS,
} from '../api/eaip.js'
import Icon from './Icon.vue'

const CHART_GROUP_ORDER = ['APT', 'SID', 'STAR', 'APP', 'OTHERS']
const ENROUTE_GROUP_ORDER = ['AREA', 'ENROUTE', 'OTHERS']
const TREE_SECTIONS = ['GEN', 'ENR', 'AD']
const FLAT_SECTIONS = ['SUP', 'AIC', 'AMDT', 'NOTAM']

const loading = ref(false)
const error = ref('')
const versionInfo = ref(null)
const mode = ref('airport') // 'airport' | 'enroute' | 'docs'

const airports = ref([])
const adData = ref(null) // { tree, charts, adFiles, aipDocs }
const enrData = ref(null) // { tree, enrouteCharts, aipDocs }
const genTree = ref([])
const docFlat = reactive({ SUP: [], AIC: [], AMDT: [], NOTAM: [] })

const selectedAirport = ref(null)
const airportSearch = ref('')

const docSearch = ref('')
const docSection = ref('GEN')
const expanded = reactive(new Set())
const currentDoc = ref(null)
const pdfLoading = ref(false)
const pdfError = ref('')

// PDF 加载: fetch → blob URL, 加载状态绑定 fetch 生命周期(内置 PDF 查看器被快速中断时 iframe load 事件不触发)
// Chrome viewer 把缩放/滚动保留在 tab 级(跨 iframe 重建甚至页面刷新), 因此每次选择条目都生成
// 新的 blob URL 强制重载 → 滚动回顶、缩放统一为默认; blob 按 url 做 LRU 缓存避免来回切换重复下载
let loadController = null
const BLOB_CACHE_MAX = 8
const blobCache = new Map()
let blobUrl = null

// PDF viewer 的 URL fragment 参数: 每次打开都定位第一页并按宽度适配
const PDF_VIEW_FRAGMENT = '#page=1&zoom=page-width'

function cacheBlob(url, blob) {
  blobCache.delete(url)
  blobCache.set(url, blob)
  if (blobCache.size > BLOB_CACHE_MAX) {
    const oldest = blobCache.keys().next().value
    if (oldest !== undefined) blobCache.delete(oldest)
  }
}

function releaseBlobUrl() {
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl)
    blobUrl = null
  }
}

function releasePdf() {
  releaseBlobUrl()
  blobCache.clear()
}

function cancelLoad() {
  if (loadController) {
    loadController.abort()
    loadController = null
  }
}

function openPdf(pdfPath, title, id) {
  let url
  try {
    url = resolveEaipUrl(pdfPath)
  } catch (e) {
    pdfError.value = e.message
    return
  }
  // 同一条目且已加载完成: 忽略重复点击
  if (currentDoc.value && currentDoc.value.id === id && currentDoc.value.blobUrl && !pdfLoading.value) return
  cancelLoad()
  pdfError.value = ''
  // 已缓存过的文件: 直接生成新 blob URL 强制重载(零网络请求, 滚动回顶/缩放重置)
  const cached = blobCache.get(url)
  if (cached) {
    releaseBlobUrl()
    blobUrl = URL.createObjectURL(cached)
    currentDoc.value = { id, title, url, pdfPath, blobUrl, src: blobUrl + PDF_VIEW_FRAGMENT }
    return
  }
  // 新文件: 走下载(只释放当前 blob URL, LRU 缓存保留供来回切换复用)
  pdfLoading.value = true
  releaseBlobUrl()
  currentDoc.value = { id, title, url, pdfPath, blobUrl: null, src: null }
  const controller = new AbortController()
  loadController = controller
  downloadPdf(url, title, controller)
}

async function downloadPdf(url, title, controller) {
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    // 下载期间用户又点了别的文档 → 丢弃本次结果
    if (!currentDoc.value || currentDoc.value.url !== url) return
    releaseBlobUrl()
    cacheBlob(url, blob)
    blobUrl = URL.createObjectURL(blob)
    currentDoc.value = { ...currentDoc.value, blobUrl, src: blobUrl + PDF_VIEW_FRAGMENT }
  } catch (e) {
    if (e.name === 'AbortError') return
    if (currentDoc.value && currentDoc.value.url === url) {
      pdfError.value = `PDF 加载失败: ${e.message || e}`
    }
  } finally {
    if (currentDoc.value && currentDoc.value.url === url) {
      pdfLoading.value = false
      if (loadController === controller) loadController = null
    }
  }
}

function retryPdf() {
  const doc = currentDoc.value
  if (!doc) return
  currentDoc.value = null
  openPdf(doc.pdfPath, doc.title, doc.id)
}

onUnmounted(() => {
  cancelLoad()
  releasePdf()
})

const secLabel = eaipSectionLabel
const nodeName = (node) => node.name_cn || node.name || '未命名文档'

const filteredAirports = computed(() => {
  const keyword = airportSearch.value.trim().toUpperCase()
  if (!keyword) return airports.value
  return airports.value.filter((ap) =>
    ap.icao.toUpperCase().includes(keyword) ||
    ap.nameCn.toUpperCase().includes(keyword) ||
    ap.nameEn.toUpperCase().includes(keyword))
})

function selectAirport(ap) {
  selectedAirport.value = ap
  docSearch.value = ''
}

// 选中机场名下的完整 AD 细则文件节点, 单独显示在分组列表最顶部
const airportAdFile = computed(() => {
  if (!selectedAirport.value || !adData.value) return null
  const found = adData.value.adFiles.find((f) => f.icao === selectedAirport.value.icao)
  return found ? found.node : null
})

const airportGroups = computed(() => {
  if (!selectedAirport.value || !adData.value) return []
  const keyword = docSearch.value.trim().toUpperCase()
  const match = (node) => !keyword || nodeName(node).toUpperCase().includes(keyword)
  const groups = []
  for (const type of CHART_GROUP_ORDER) {
    const items = adData.value.charts
      .filter((c) => c.icao === selectedAirport.value.icao && c.chartType === type && match(c.node))
    if (items.length > 0) groups.push({ label: CHART_TYPE_LABELS[type], items })
  }
  return groups
})

const enrouteGroups = computed(() => {
  if (!enrData.value) return []
  const keyword = docSearch.value.trim().toUpperCase()
  const groups = []
  for (const type of ENROUTE_GROUP_ORDER) {
    const items = enrData.value.enrouteCharts
      .filter((c) => c.chartType === type &&
        (!keyword || nodeName(c.node).toUpperCase().includes(keyword)))
    if (items.length > 0) groups.push({ label: ENROUTE_TYPE_LABELS[type], items })
  }
  return groups
})

const docSections = computed(() => {
  if (genTree.value.length === 0) return []
  return ['GEN', 'ENR', 'AD', ...FLAT_SECTIONS.filter((s) => docFlat[s].length > 0)]
})

const isTreeSection = computed(() => TREE_SECTIONS.includes(docSection.value))

const currentDocTree = computed(() => {
  if (docSection.value === 'GEN') return genTree.value
  if (docSection.value === 'ENR') return enrData.value ? enrData.value.tree : []
  if (docSection.value === 'AD') return adData.value ? adData.value.tree : []
  return []
})

// 树懒展开: 只渲染已展开分支的可见行
const visibleRows = computed(() => {
  const rows = []
  const walk = (nodes, depth) => {
    for (const node of nodes) {
      rows.push({ node, depth })
      if (node.children.length > 0 && expanded.has(node.id)) {
        walk(node.children, depth + 1)
      }
    }
  }
  walk(currentDocTree.value, 0)
  return rows
})

const treeFlatDocs = computed(() => {
  const out = []
  const walk = (nodes) => {
    for (const node of nodes) {
      if (node.pdfPath) out.push(node)
      if (node.children.length > 0) walk(node.children)
    }
  }
  walk(currentDocTree.value)
  return out
})

const filteredDocResults = computed(() => {
  const keyword = docSearch.value.trim().toUpperCase()
  if (!keyword) return []
  return treeFlatDocs.value
    .filter((node) => nodeName(node).toUpperCase().includes(keyword))
    .slice(0, 200)
})

const flatDocs = computed(() => docFlat[docSection.value] || [])

const filteredFlatDocs = computed(() => {
  const keyword = docSearch.value.trim().toUpperCase()
  if (!keyword) return flatDocs.value
  return flatDocs.value.filter((doc) =>
    doc.nameCn.toUpperCase().includes(keyword) || doc.name.toUpperCase().includes(keyword))
})

function switchMode(next) {
  mode.value = next
  docSearch.value = ''
}

function selectNode(node) {
  openPdf(node.pdfPath, nodeName(node), node.id)
}

function selectFlatDoc(doc) {
  openPdf(doc.pdfPath, doc.nameCn, doc.id)
}

function onRowClick(node) {
  if (node.pdfPath) {
    selectNode(node)
  } else if (node.children.length > 0) {
    if (expanded.has(node.id)) {
      expanded.delete(node.id)
    } else {
      expanded.add(node.id)
    }
  }
}

async function loadAll() {
  loading.value = true
  error.value = ''
  pdfError.value = ''
  cancelLoad()
  releasePdf()
  currentDoc.value = null
  selectedAirport.value = null
  airportSearch.value = ''
  docSearch.value = ''
  expanded.clear()
  try {
    const [version, sectionResults] = await Promise.all([
      fetchEaipVersion(),
      fetchEaipAllSections(),
    ])
    versionInfo.value = version

    const bySection = Object.fromEntries(sectionResults.map((r) => [r.section, r.nodes]))
    if (!bySection.AD || !bySection.ENR) {
      throw new Error('缺少 AD/ENR 索引数据')
    }

    adData.value = parseAdSection(bySection.AD)
    enrData.value = parseEnrSection(bySection.ENR)
    genTree.value = buildSectionTree(bySection.GEN || [])
    airports.value = adData.value.airports
    docFlat.SUP = parseFlatSection(bySection.SUP || [], 'SUP')
    docFlat.AIC = parseFlatSection(bySection.AIC || [], 'AIC')
    docFlat.AMDT = parseAmdtSection(bySection.AMDT || [])
    docFlat.NOTAM = parseNotamSection(bySection.NOTAM || [])

    if (airports.value.length === 0) {
      throw new Error('没有可用的机场数据')
    }
  } catch (e) {
    error.value = `航图数据加载失败: ${e.message || e}`
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
.chart-query {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chart-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--glass);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px 16px;
}

.chart-title { display: flex; align-items: center; gap: 10px; color: var(--text-accent); }
.chart-title-text { font-size: 15px; font-weight: 700; color: var(--text); }
.chart-version { font-size: 12px; color: var(--text-dim); font-weight: 400; }

.chart-error {
  display: flex; align-items: center; gap: 10px;
  background: var(--red-bg);
  border: 1px solid var(--red-border);
  color: var(--red);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13px;
}
.chart-retry {
  margin-left: auto;
  border: 1px solid var(--red-border);
  background: transparent;
  color: var(--red);
  border-radius: 8px;
  padding: 5px 12px;
  cursor: pointer;
  font-size: 12px;
}
.chart-retry:hover { background: var(--red-bg); }

.chart-layout {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 14px;
}

/* 左栏 */
.chart-side {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.chart-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chart-tab {
  border: 1px solid var(--border);
  background: var(--glass);
  color: var(--text-dim);
  font-size: 12px;
  padding: 5px 11px;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.18s;
  font-family: inherit;
}
.chart-tab:hover { border-color: var(--text-accent); color: var(--text); }
.chart-tab.active { background: var(--active-bg); border-color: var(--text-accent); color: var(--text-accent); }

.chart-search {
  position: relative;
  display: flex;
  align-items: center;
}
.chart-search-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--glass-input);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.chart-search-input:focus { border-color: var(--text-accent); }
.chart-search-input::placeholder { color: var(--text-muted); }

/* 机场详情头部 */
.airport-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.airport-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  border: none;
  background: transparent;
  color: var(--text-accent);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 0;
  font-family: inherit;
}
.airport-back:hover { text-decoration: underline; }
.airport-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: var(--glass);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 6px;
}

.group-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-accent);
  letter-spacing: 1px;
  padding: 10px 8px 4px;
  position: sticky;
  top: 0;
  background: var(--glass-strong);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  z-index: 1;
  border-radius: 6px;
}
.group-count {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
}

.chart-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  color: var(--text-dim);
  font-size: 12.5px;
  padding: 7px 8px;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
  text-align: left;
}
.chart-row:hover { background: var(--hover-bg); color: var(--text); }
.chart-row.selected { background: var(--active-bg); color: var(--text-accent); }
.chart-row.selected .row-name { color: var(--text-accent); }
.row-toggle {
  width: 14px;
  flex-shrink: 0;
  display: flex;
  color: var(--text-muted);
  transition: transform 0.18s;
}
.row-toggle.expanded { transform: rotate(90deg); }
.row-toggle:empty { display: none; }
.row-icon { display: flex; flex-shrink: 0; }
.row-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}
.row-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
.row-crumbs {
  font-size: 10.5px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-icao {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-accent);
  background: var(--hover-bg);
  border-radius: 5px;
  padding: 1px 5px;
  flex-shrink: 0;
}
.chart-empty { text-align: center; color: var(--text-muted); font-size: 12px; padding: 24px 0; }

/* 右栏 PDF 阅读器 */
.chart-viewer {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.viewer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--glass);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px 16px;
}
.viewer-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.viewer-open {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px; height: 30px;
  flex-shrink: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-dim);
  transition: all 0.2s;
}
.viewer-open:hover { background: var(--hover-bg); color: var(--text-accent); border-color: var(--border-strong); }

.viewer-body {
  flex: 1;
  min-height: 0;
  display: flex;
}
.viewer-frame-box {
  position: relative;
  flex: 1;
  display: flex;
  background: var(--glass);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
}
.viewer-frame {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
}
.viewer-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-dim);
  font-size: 13px;
  background: var(--glass-strong);
  z-index: 2;
}
.viewer-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--red);
  font-size: 13px;
  background: var(--glass-strong);
  z-index: 2;
}
.viewer-retry {
  border: 1px solid var(--red-border);
  background: transparent;
  color: var(--red);
  border-radius: 8px;
  padding: 5px 12px;
  cursor: pointer;
  font-size: 12px;
}
.viewer-retry:hover { background: var(--red-bg); }
.viewer-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--glass);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  border: 1px dashed var(--border);
  border-radius: 14px;
  color: var(--text-dim);
  font-size: 13px;
}
.placeholder-icon { color: var(--text-muted); }
.placeholder-sub { font-size: 11px; color: var(--text-muted); }

.spinner {
  width: 16px; height: 16px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--text-accent);
  border-radius: 50%;
  animation: chart-spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes chart-spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  /* 移动端页面级滚动: 列表保持内部滚动, 整页在 main-content 里上下滑动 */
  .chart-query { height: auto; min-height: 100%; }
  .chart-layout { flex-direction: column; }
  .chart-side { width: 100%; flex-shrink: 0; }
  .chart-list { max-height: 240px; flex-shrink: 0; }
  .chart-viewer { flex: none; }
  .viewer-body { min-height: 480px; }
}
</style>

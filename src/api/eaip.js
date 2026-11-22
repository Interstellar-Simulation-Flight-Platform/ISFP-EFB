// EAIP 航图数据层。数据源: https://eaip.flyisfp.com/Data (经同源 /eaip 代理, 避免跨域)
// 目录/分类仿 eAIP-Pad: Data/Customers.js 为周期元信息, Data/JsonPath/{章节}.JSON 为文档索引;
// AD 树按机场归属拆为 机场航图/机场AIP文字页/普通AIP文档, ENR 树按 "EN-ROUTE CHARTS" 子树拆出航路图,
// 航图按名称细分类型: 机场图/离场/进场/进近/其他; 航路图细分: 区域图/航路图/其他

const EAIP_BASE = '/eaip'

const REQUIRED_SECTIONS = ['AD', 'GEN', 'ENR']
const OPTIONAL_SECTIONS = ['SUP', 'AIC', 'AMDT', 'NOTAM']
export const EAIP_SECTIONS = [...REQUIRED_SECTIONS, ...OPTIONAL_SECTIONS]

const SECTION_LABELS = {
  AD: '机场 (AD)',
  GEN: '总则 (GEN)',
  ENR: '航路 (ENR)',
  SUP: '补充 (SUP)',
  AIC: '航行情报 (AIC)',
  AMDT: '修订 (AMDT)',
  NOTAM: 'NOTAM',
}
export const eaipSectionLabel = (section) => SECTION_LABELS[section] || section

// 机场航图类型中文标签（对应 chartType: APT/SID/STAR/APP/OTHERS）
export const CHART_TYPE_LABELS = {
  APT: '机场图',
  SID: '离场图',
  STAR: '进场图',
  APP: '进近图',
  OTHERS: '其他航图',
}
// 航路图类型中文标签（AREA/ENROUTE/OTHERS）
export const ENROUTE_TYPE_LABELS = {
  AREA: '区域图',
  ENROUTE: '航路图',
  OTHERS: '其他航图',
}

// 机场航图类型判定，照抄 eAIP-Pad EAIPChartClassifier.classify
export function classifyChart(name) {
  const upper = (name || '').toUpperCase()
  if (upper.includes('SID')) return 'SID'
  if (upper.includes('STAR')) return 'STAR'
  if (
    upper.includes('IAC') || upper.includes('ILS') || upper.includes('VOR') ||
    (upper.includes('RNP') && upper.includes('APCH'))
  ) return 'APP'
  if (
    upper.includes('ADC') || upper.includes('APDC') || upper.includes('AOC') ||
    upper.includes('GMC') || upper.includes('PATC') || upper.includes('FDA') ||
    upper.includes('WAYPOINT') || upper.includes('CODING TABLE')
  ) return 'APT'
  return 'OTHERS'
}

// 航路图类型判定，照抄 eAIP-Pad EAIPChartClassifier.classifyEnroute
export function classifyEnroute(name, nameCn = '') {
  const upper = (name || '').toUpperCase()
  const words = upper.split(/[^A-Za-z0-9]+/)
  const localized = `${name || ''} ${nameCn || ''}`
  if (upper.includes('AREA') || words.includes('ARC') || localized.includes('区域图') || localized.includes('區域圖')) {
    return 'AREA'
  }
  if (upper.includes('EN-ROUTE CHART') || upper.includes('ENROUTE CHART')) return 'ENROUTE'
  return 'OTHERS'
}

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok) {
    const err = new Error(`HTTP ${response.status}`)
    err.status = response.status
    throw err
  }
  return response.text()
}

// Customers.js 的键名未加引号(非合法 JSON, eAIP-Pad 为此手写了专用解析器); 补引号修复后再 parse
function parseCustomers(text) {
  const raw = text.replace(/^\s*var\s+Customers\s*=\s*/, '').trim().replace(/;\s*$/, '')
  const json = raw.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":')
  const list = JSON.parse(json)
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('Customers.js 中没有周期数据')
  }
  return list[0]
}

export async function fetchEaipVersion() {
  const text = await fetchText(`${EAIP_BASE}/Data/Customers.js`)
  const customer = parseCustomers(text)
  return {
    dataName: customer.DataName || '',
    dataVersion: customer.DataVersion || '',
    effectiveShow: customer.EffectiveShow || '',
    publishDate: customer.PublishDate || '',
    notamDate: customer.NotamDate || '',
  }
}

// 拉取单章节索引: 节点数组, 树形关系靠 pId 父引用, pdfPath 为相对源站的文档路径
export async function fetchEaipIndex(section) {
  const text = await fetchText(`${EAIP_BASE}/Data/JsonPath/${section}.JSON`)
  return JSON.parse(text)
}

// 全部章节: 可选章节 404 时静默跳过
export async function fetchEaipAllSections() {
  const results = await Promise.all(
    EAIP_SECTIONS.map(async (section) => {
      try {
        return { section, nodes: await fetchEaipIndex(section), error: null }
      } catch (e) {
        if (REQUIRED_SECTIONS.includes(section)) throw e
        return { section, nodes: null, error: e }
      }
    })
  )
  return results.filter((r) => r.nodes)
}

// pId 引用构建树; 孤儿节点(父引用不存在)归入顶层, 防御脏数据
export function buildSectionTree(nodes) {
  const map = new Map()
  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] })
  }
  const roots = []
  for (const node of nodes) {
    const item = map.get(node.id)
    const parent = node.pId ? map.get(node.pId) : null
    if (parent && parent !== item) {
      parent.children.push(item)
    } else {
      roots.push(item)
    }
  }
  return roots
}

// 仿 eAIP-Pad AIRACServerClient.resourceURL:
// 解码 → 拒绝反斜杠与 .. 段(路径逃逸防护) → 逐段编码拼到代理前缀后
export function resolveEaipUrl(pdfPath) {
  if (!pdfPath || typeof pdfPath !== 'string') {
    throw new Error('文档缺少 pdfPath')
  }
  const relative = pdfPath.startsWith('/') ? pdfPath.slice(1) : pdfPath
  let decoded
  try {
    decoded = decodeURIComponent(relative)
  } catch {
    throw new Error('无效的文件路径')
  }
  if (decoded.includes('\\')) {
    throw new Error('非法的文件路径')
  }
  const segments = decoded.split('/').filter((s) => s !== '')
  if (segments.length === 0 || segments.some((s) => s === '.' || s === '..')) {
    throw new Error('非法的文件路径')
  }
  return `${EAIP_BASE}/${segments.map(encodeURIComponent).join('/')}`
}

function flattenNodes(tree) {
  const out = []
  const walk = (nodes) => {
    for (const node of nodes) {
      if (node.pdfPath) out.push(node)
      if (node.children && node.children.length > 0) walk(node.children)
    }
  }
  walk(tree)
  return out
}

function stripIcaoPrefix(name, icao) {
  return (name || '').startsWith(`${icao}-`) ? name.slice(icao.length + 1) : (name || '')
}

const CHART_BRANCH_PATTERNS = ['机场航图', '机场有关的航图', '机场相关航图']

// 仿 eAIP-Pad parseAD: 沿 AD 目录树传递所属机场与航图分组
// 文字页节点(AD 2.1/2.2...)全部指向机场细则整章 PDF, 按文件去重后每个机场只保留一份完整文件条目
export function parseAdSection(nodes) {
  const tree = buildSectionTree(nodes)
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const roots = nodes.filter((n) => !byId.get(n.pId)).map((n) => n.id)
  const childrenOf = new Map()
  for (const node of nodes) {
    if (!childrenOf.has(node.pId)) childrenOf.set(node.pId, [])
    childrenOf.get(node.pId).push(node)
  }

  const airports = new Map() // icao -> { nameEn, nameCn }
  const charts = [] // { icao, chartType, node }
  const adFiles = [] // { icao, node } 每机场每份细则文件一条
  const aipDocs = [] // { node }
  const adFileSeen = new Set()

  // 迭代 DFS: 任意深度的 PDF 都必须进入所属机场或目录
  const stack = roots.slice().reverse().map((id) => ({ id, owner: null, isChart: false }))
  while (stack.length > 0) {
    const { id, owner, isChart } = stack.pop()
    const node = byId.get(id)
    if (!node) continue
    let currentOwner = owner
    let currentIsChart = isChart
    const icao = (node.airporticao || '').trim()
    if (icao && (!currentOwner || currentOwner.icao !== icao)) {
      currentOwner = { icao, rootID: node.id }
      currentIsChart = false
      if (!airports.has(icao)) {
        airports.set(icao, {
          icao,
          nameEn: stripIcaoPrefix(node.name, icao),
          nameCn: stripIcaoPrefix(node.name_cn || node.name, icao),
        })
      }
    }
    if (currentOwner) {
      const name = node.name || ''
      const nameCn = node.name_cn || ''
      const matchesChartBranch =
        name.toLowerCase().includes('charts related to an aerodrome') ||
        CHART_BRANCH_PATTERNS.some((p) => nameCn.includes(p))
      if (matchesChartBranch && !currentIsChart) {
        // "机场航图"分支的标题节点自身不作为独立条目(其内容即分支内全部航图), 仅标记后代
        currentIsChart = true
        const children = childrenOf.get(id) || []
        for (const child of children.slice().reverse()) {
          stack.push({ id: child.id, owner: currentOwner, isChart: currentIsChart })
        }
        continue
      }
      if (matchesChartBranch) currentIsChart = true
    }
    if (node.pdfPath) {
      if (!currentOwner) {
        aipDocs.push(node)
      } else if (currentIsChart) {
        charts.push({ icao: currentOwner.icao, chartType: classifyChart(node.name), node })
      } else {
        // 同一机场的文字页共享整章 PDF, 只保留一份完整文件条目
        const key = `${currentOwner.icao}|${node.pdfPath}`
        if (!adFileSeen.has(key)) {
          adFileSeen.add(key)
          adFiles.push({
            icao: currentOwner.icao,
            node: {
              ...node,
              id: `${currentOwner.icao}_ad_${adFiles.length}`,
              name: 'Aerodrome data',
              name_cn: '机场资料',
            },
          })
        }
      }
    }
    const children = childrenOf.get(id) || []
    for (const child of children.slice().reverse()) {
      stack.push({ id: child.id, owner: currentOwner, isChart: currentIsChart })
    }
  }

  return {
    tree,
    airports: [...airports.values()].sort((a, b) => a.icao < b.icao ? -1 : 1),
    charts,
    adFiles,
    aipDocs,
    flatAip: flattenNodes(tree),
  }
}

// 仿 eAIP-Pad parseENR: "EN-ROUTE CHARTS" 子树为航路图, 其余为 AIP 文档
// 返回 { tree, enrouteCharts, aipDocs }
export function parseEnrSection(nodes) {
  const tree = buildSectionTree(nodes)
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const childrenOf = new Map()
  for (const node of nodes) {
    if (!childrenOf.has(node.pId)) childrenOf.set(node.pId, [])
    childrenOf.get(node.pId).push(node)
  }

  // 从名称含 EN-ROUTE CHARTS 的根收集整个子树
  const enrouteIds = new Set()
  const chartRootIds = nodes
    .filter((n) => (n.name || '').toUpperCase().includes('EN-ROUTE CHARTS'))
    .map((n) => n.id)
  const stack = [...chartRootIds]
  while (stack.length > 0) {
    const current = stack.pop()
    if (enrouteIds.has(current)) continue
    enrouteIds.add(current)
    for (const child of childrenOf.get(current) || []) {
      stack.push(child.id)
    }
  }

  const enrouteCharts = []
  const aipDocs = []
  for (const node of nodes) {
    if (!node.pdfPath) continue
    if (enrouteIds.has(node.id)) {
      enrouteCharts.push({ chartType: classifyEnroute(node.name, node.name_cn), node })
    } else {
      aipDocs.push(node)
    }
  }
  return { tree, enrouteCharts, aipDocs }
}

// SUP/AIC: 平铺数组 { Id, Document, Serial, Subject, Local_Subject, ... }
export function parseFlatSection(nodes, section) {
  return nodes.map((doc) => ({
    id: doc.Id || doc.id,
    name: doc.Subject || doc.Local_Subject || doc.Serial || section,
    nameCn: doc.Local_Subject || doc.Subject || doc.Serial || section,
    serial: doc.Serial || '',
    chapterType: doc.CHAPTER_TYPE || '',
    pdfPath: doc.Document || '',
  })).filter((d) => d.pdfPath)
}

// NOTAM: 平铺数组 { SeriesName, Document, GenerateTime, GenerateTime_En }
export function parseNotamSection(nodes) {
  return nodes.map((doc) => ({
    id: `${doc.SeriesName}_${doc.GenerateTime}`,
    name: `NOTAM ${doc.SeriesName}`,
    nameCn: `NOTAM ${doc.SeriesName}`,
    serial: doc.SeriesName || '',
    generateTime: doc.GenerateTime || '',
    pdfPath: doc.Document || '',
  })).filter((d) => d.pdfPath)
}

// AMDT: 树形节点数组, 展平并转成与平铺章节统一的 { id, name, nameCn, pdfPath }
export function parseAmdtSection(nodes) {
  return flattenNodes(buildSectionTree(nodes)).map((node) => ({
    id: node.id,
    name: node.name || '',
    nameCn: node.name_cn || node.name || '未命名修订',
    serial: '',
    pdfPath: node.pdfPath,
  }))
}

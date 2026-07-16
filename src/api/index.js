const API_BASE = '/api/isfp'
const ROUTE_API = '/api/route'
const AVIATION_API = '/api/aviation'

const AIRAC_CYCLE = '2605'

async function isfpFetch(url, options = {}) {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const text = await response.text()

  if (text.startsWith('url0=') || text.startsWith('url=')) {
    const match = text.match(/^url\d*=(.+)/)
    if (match && match[1]) {
      const redirectUrl = match[1].replace(/^[`'" ]+|[`'"]+$/g, '').trim()
      return isfpFetch(redirectUrl, options)
    }
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function fetchRoute(dep, arr) {
  const params = new URLSearchParams({
    dep,
    arr,
    xt: 'FSINN',
    b: `AIRAC${AIRAC_CYCLE}`
  })
  const url = `${ROUTE_API}/api.php?${params.toString()}`
  const text = await isfpFetch(url)
  if (typeof text !== 'string') return null
  return parseRouteFromSpf(text, dep, arr)
}

function parseRouteFromSpf(content, dep, arr) {
  const lines = content.split('\n').filter(line => line.trim() !== '')

  let airwayLine = null
  for (const line of lines) {
    if (line.includes('=') && (line.includes('route') || line.includes('Route'))) {
      airwayLine = line
      break
    }
  }

  if (!airwayLine && lines.length >= 2) {
    airwayLine = lines[lines.length - 2]
  }

  if (!airwayLine) return null

  const parts = airwayLine.split('=')
  if (parts.length < 2) return null

  const airway = parts[1].trim().replace(/^["']|['"]$/g, '')
  if (!airway) return null

  const airwayHandIn = airway.length > 19
    ? airway.substring(9, airway.length - 10)
    : airway

  return { airway, airwayHandIn, dep, arr }
}

export async function fetchMetar(icao) {
  const url = `${API_BASE}/metar?icao=${icao.toUpperCase()}`
  const data = await isfpFetch(url)
  if (data && data.code === 'GET_METAR' && data.data && data.data.length > 0) {
    return data.data[0]
  }
  return null
}

export async function fetchTaf(icao) {
  const codes = icao.split(',').map(c => c.trim().toUpperCase()).filter(Boolean)
  const url = `${AVIATION_API}/api/data/taf?ids=${codes.join(',')}`
  const response = await fetch(url, {
    headers: { 'Accept': 'text/plain' }
  })
  if (!response.ok) {
    if (response.status === 204) return null
    throw new Error(`TAF查询失败: HTTP ${response.status}`)
  }
  const rawText = await response.text()
  if (!rawText || !rawText.trim()) return null

  const tafList = rawText.split(/(?=TAF\s+[A-Z]{4})/).filter(e => e.trim())

  const results = []
  for (const code of codes) {
    const match = tafList.find(entry => {
      const m = entry.match(/^TAF\s+([A-Z]{4})/)
      return m && m[1] === code
    })
    results.push({
      icao: code,
      taf: match ? match.trim() : null
    })
  }
  return results
}

export async function fetchOnlineStatus() {
  const url = `${API_BASE}/clients/status`
  return isfpFetch(url)
}

export async function loadAirportData() {
  const response = await fetch('/airports.json')
  if (!response.ok) throw new Error('机场数据加载失败')
  return response.json()
}

export async function loadTimezoneTranslations() {
  const response = await fetch('/timezone_translations.json')
  if (!response.ok) return {}
  return response.json()
}

export async function loadCountryNames() {
  const response = await fetch('/country_multilingual.csv')
  if (!response.ok) return {}
  const text = await response.text()
  const map = {}
  const lines = text.split('\n').slice(1)
  for (const line of lines) {
    const cols = line.replace(/"/g, '').split(',')
    if (cols.length >= 6) {
      const code = cols[2]
      const name = cols[5]
      if (code && name) map[code] = name
    }
  }
  return map
}

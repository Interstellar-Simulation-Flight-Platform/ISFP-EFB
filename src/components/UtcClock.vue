<template>
  <div class="utc-clock">
    <div v-for="(unit, idx) in units" :key="idx" class="clock-unit">
      <div v-if="unit.type === 'sep'" class="flip-sep">:</div>
      <div v-else class="flip-box" :class="{ flipping: unit.flipping }">
        <div class="flip-top-half">
          <span class="flip-num top-num">{{ unit.now }}</span>
        </div>
        <div class="flip-divider"></div>
        <div class="flip-bottom-half">
          <span class="flip-num bottom-num">{{ unit.now }}</span>
        </div>
        <div v-if="unit.flipping" class="flip-leaf">
          <div class="flip-leaf-front">
            <span class="flip-num top-num">{{ unit.prev }}</span>
          </div>
          <div class="flip-leaf-back">
            <span class="flip-num top-num">{{ unit.now }}</span>
          </div>
        </div>
      </div>
    </div>
    <span class="utc-label">UTC</span>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'

const units = reactive([
  { type: 'digit', now: '0', prev: '0', flipping: false },
  { type: 'digit', now: '0', prev: '0', flipping: false },
  { type: 'sep' },
  { type: 'digit', now: '0', prev: '0', flipping: false },
  { type: 'digit', now: '0', prev: '0', flipping: false },
  { type: 'sep' },
  { type: 'digit', now: '0', prev: '0', flipping: false },
  { type: 'digit', now: '0', prev: '0', flipping: false },
])

const digitIdx = [0, 1, 3, 4, 6, 7]
let timer = null

function getUtcDigits() {
  const now = new Date()
  const h = String(now.getUTCHours()).padStart(2, '0')
  const m = String(now.getUTCMinutes()).padStart(2, '0')
  const s = String(now.getUTCSeconds()).padStart(2, '0')
  return (h + m + s).split('')
}

function update() {
  const newDigits = getUtcDigits()
  for (let i = 0; i < 6; i++) {
    const idx = digitIdx[i]
    if (newDigits[i] !== units[idx].now) {
      units[idx].prev = units[idx].now
      units[idx].now = newDigits[i]
      units[idx].flipping = true
      setTimeout(() => {
        units[idx].flipping = false
      }, 350)
    }
  }
}

onMounted(() => {
  const d = getUtcDigits()
  for (let i = 0; i < 6; i++) {
    units[digitIdx[i]].now = d[i]
    units[digitIdx[i]].prev = d[i]
  }
  const ms = 1000 - new Date().getMilliseconds()
  setTimeout(() => {
    update()
    timer = setInterval(update, 1000)
  }, ms)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.utc-clock {
  display: flex;
  align-items: center;
  gap: 1px;
  background: var(--glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
}

.clock-unit { display: flex; align-items: center; }

.flip-box {
  width: 26px;
  height: 38px;
  position: relative;
  border-radius: 5px;
  overflow: hidden;
}

.flip-top-half {
  position: absolute; top: 0; left: 0; width: 100%; height: 50%;
  overflow: hidden; background: var(--glass-strong);
  border: 1px solid var(--border-light); border-bottom: none;
  border-radius: 5px 5px 0 0;
}
.flip-bottom-half {
  position: absolute; bottom: 0; left: 0; width: 100%; height: 50%;
  overflow: hidden; background: var(--glass-strong);
  border: 1px solid var(--border-light); border-top: none;
  border-radius: 0 0 5px 5px;
}
.flip-divider {
  position: absolute; top: 50%; left: 0; width: 100%; height: 1px;
  background: var(--border); z-index: 3;
}
.flip-num {
  position: absolute; left: 0; width: 100%; height: 38px; line-height: 38px;
  font-size: 22px; font-weight: 700;
  font-family: 'Consolas', 'Courier New', monospace;
  text-align: center; color: var(--text-accent);
}
.top-num { top: 0; }
.bottom-num { top: -19px; }

.flip-leaf {
  position: absolute; left: 0; top: 0; width: 100%; height: 50%;
  transform-origin: bottom center;
  animation: flipDown 0.35s ease-in forwards;
  transform-style: preserve-3d; z-index: 4;
}
.flip-leaf-front, .flip-leaf-back {
  position: absolute; width: 100%; height: 100%; overflow: hidden;
  border: 1px solid var(--border-light); border-radius: 5px 5px 0 0;
}
.flip-leaf-front { background: var(--glass-strong); backface-visibility: hidden; }
.flip-leaf-back { background: var(--glass-code); transform: rotateX(180deg); backface-visibility: hidden; }

@keyframes flipDown {
  0% { transform: rotateX(0deg); }
  100% { transform: rotateX(-180deg); }
}

.flip-sep {
  font-size: 18px; color: var(--text-muted); font-weight: 700;
  width: 10px; text-align: center; line-height: 38px;
}
.utc-label {
  font-size: 10px; color: var(--text-muted); font-weight: 700;
  margin-left: 8px; letter-spacing: 2px;
}

@media (max-width: 768px) {
  .flip-box { width: 20px; height: 30px; }
  .flip-num { height: 30px; line-height: 30px; font-size: 16px; }
  .bottom-num { top: -15px; }
  .flip-sep { line-height: 30px; font-size: 14px; }
}
</style>

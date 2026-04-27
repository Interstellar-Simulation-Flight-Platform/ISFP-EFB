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
  background: var(--bg-sidebar);
  padding: 3px 8px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.clock-unit {
  display: flex;
  align-items: center;
}

.flip-box {
  width: 28px;
  height: 40px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.flip-top-half {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}

.flip-bottom-half {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 4px 4px;
}

.flip-divider {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--bg-input);
  z-index: 3;
}

.flip-num {
  position: absolute;
  left: 0;
  width: 100%;
  height: 40px;
  line-height: 40px;
  font-size: 24px;
  font-weight: 700;
  font-family: 'Consolas', 'Courier New', monospace;
  text-align: center;
  color: var(--text-accent);
}

.top-num {
  top: 0;
}

.bottom-num {
  top: -20px;
}

.flip-leaf {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 50%;
  transform-origin: bottom center;
  animation: flipDown 0.35s ease-in forwards;
  transform-style: preserve-3d;
  z-index: 4;
}

.flip-leaf-front,
.flip-leaf-back {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 4px 4px 0 0;
}

.flip-leaf-front {
  background: var(--bg-input);
  backface-visibility: hidden;
}

.flip-leaf-back {
  background: var(--bg-code);
  transform: rotateX(180deg);
  backface-visibility: hidden;
}

@keyframes flipDown {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-180deg);
  }
}

.flip-sep {
  font-size: 18px;
  color: var(--text-muted);
  font-weight: 700;
  width: 10px;
  text-align: center;
  line-height: 40px;
}

.utc-label {
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 700;
  margin-left: 6px;
  letter-spacing: 2px;
}

@media (max-width: 768px) {
  .flip-box {
    width: 22px;
    height: 32px;
  }
  .flip-num {
    height: 32px;
    line-height: 32px;
    font-size: 18px;
  }
  .bottom-num {
    top: -16px;
  }
  .flip-sep {
    line-height: 32px;
    font-size: 15px;
  }
}
</style>

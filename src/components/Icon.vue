<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="efb-icon"
    aria-hidden="true"
    v-html="paths[name] || ''"
  />
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  strokeWidth: { type: [Number, String], default: 1.8 },
})

const paths = {
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  weather: '<path d="M6 16a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.3A4.5 4.5 0 0 1 18 16Z"/><path d="M8 19v2M12 19v3M16 19v2"/>',
  airport: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>',
  map: '<path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z"/><path d="M9 4v13M15 6.5v13"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.6.6 0 0 0-.5.1l-.4.4a.5.5 0 0 0 0 .7L8 11l-3 3-2.5-.5a.5.5 0 0 0-.4.1l-.4.4a.4.4 0 0 0 .1.6L4 16.5l1.5 2.2a.4.4 0 0 0 .6.1l.4-.4a.5.5 0 0 0 .1-.4L6 15.5l3-3 3.6 4.1a.5.5 0 0 0 .7 0l.4-.4a.6.6 0 0 0 .1-.5Z"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  headset: '<path d="M3 14v-3a9 9 0 0 1 18 0v3"/><path d="M21 16a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2ZM3 16a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2Z"/><path d="M18 18a4 4 0 0 1-4 3h-2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.4-2.6L3 16"/><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.4 2.6L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
  chart: '<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="7"/><rect x="12" y="7" width="3" height="11"/><rect x="17" y="13" width="3" height="5"/>',
  antenna: '<path d="M4.9 16a10 10 0 0 1 0-8M19.1 16a10 10 0 0 0 0-8M7.8 14.5a6 6 0 0 1 0-5M16.2 14.5a6 6 0 0 0 0-5"/><circle cx="12" cy="12" r="2"/><path d="M12 14v8"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
  gauge: '<path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="m13.4 10.6 3.6-3.6"/><path d="M3.3 17a9 9 0 1 1 17.4 0"/>',
  altitude: '<path d="m3 17 6-6 4 4 8-8"/><path d="M21 7v4h-4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15 9-2 6-4 1 2-6 4-1Z"/>',
  tower: '<path d="M8.5 21h7M9 21V9M15 21V9M9 9l1-5h4l1 5M7 9h10"/>',
  signal: '<path d="M2 20h.01M6 20v-4M10 20v-8M14 20V8M18 20V4"/>',
  route2: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h6a4 4 0 0 1 0 8H10a4 4 0 0 0 0 8h0"/>',
  fuel: '<path d="M3 22h12V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1Z"/><path d="M15 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-4 0v-4h-1M6 13h6"/>',
}
</script>

<style scoped>
.efb-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>

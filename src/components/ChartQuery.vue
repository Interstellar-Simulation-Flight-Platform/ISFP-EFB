<template>
  <div class=""chart-query"">
    <div class=""chart-header"">
      <h2>航图查询</h2>
      <p class=""chart-desc"">访问 ISFP 电子航图信息平台</p>
    </div>
    
    <div class=""chart-content"">
      <div class=""chart-info"">
        <p>点击以下按钮访问航图查询系统：</p>
        <a 
          href=""https://eaip.flyisfp.com"" 
          target=""_blank"" 
          rel=""noopener noreferrer""
          class=""chart-link-btn""
        >
          <span class=""btn-icon"">📊</span>
          <span>访问 eaip.flyisfp.com</span>
        </a>
      </div>
      
      <div class=""chart-features"">
        <h3>航图信息平台功能</h3>
        <ul>
          <li>✈️ 机场航图</li>
          <li>🗺️ 区域航图</li>
          <li>🛫 进离场程序</li>
          <li>📡 导航设施信息</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.chart-query {
  max-width: 800px;
  margin: 0 auto;
}

.chart-header {
  margin-bottom: 24px;
}

.chart-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.chart-desc {
  font-size: 14px;
  color: var(--text-dim);
}

.chart-content {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.chart-info {
  margin-bottom: 24px;
}

.chart-info p {
  font-size: 14px;
  color: var(--text-dim);
  margin-bottom: 16px;
}

.chart-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(26, 109, 212, 0.3);
}

.chart-link-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(26, 109, 212, 0.4);
}

.btn-icon {
  font-size: 18px;
}

.chart-features {
  border-top: 1px solid var(--border);
  padding-top: 20px;
}

.chart-features h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}

.chart-features ul {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.chart-features li {
  font-size: 14px;
  color: var(--text-dim);
  padding: 8px 12px;
  background: var(--bg-input);
  border-radius: 6px;
  border: 1px solid var(--border);
}

@media (max-width: 600px) {
  .chart-content {
    padding: 16px;
  }
  
  .chart-features ul {
    grid-template-columns: 1fr;
  }
}
</style>

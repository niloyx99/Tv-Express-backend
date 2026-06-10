let startedAt: Date | null = null;

export function markApiRunning() {
  startedAt = new Date();
}

export function getApiRuntimeStatus() {
  const running = startedAt !== null;
  const uptimeMs = startedAt ? Date.now() - startedAt.getTime() : 0;

  return {
    status: running ? 'API running' : 'API stopped',
    running,
    startedAt: startedAt?.toISOString() ?? null,
    uptimeMs,
    uptime: formatUptime(uptimeMs),
  };
}

function formatUptime(ms: number) {
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

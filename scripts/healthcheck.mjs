const HOST = Bun.env.HOST || 'localhost'
const PORT = Bun.env.PORT || 3990

try {
  const response = await fetch(`http://${HOST}:${PORT}/api/healthz`)
  process.exit(response.ok ? 0 : 1)
} catch (error) {
  console.error(error)
  process.exit(1)
}

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    mcpServer: process.env.ENABLE_NEXT_MCP === 'true',
  },
}

export default nextConfig

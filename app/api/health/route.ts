import { NextResponse } from 'next/server'
import { supabase, isLocalMode } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET() {
  const startTime = Date.now()
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      api: 'ok',
      database: 'unknown',
      mode: isLocalMode ? 'local' : 'online',
    },
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    responseTime: 0,
  }

  // Check database connection
  if (!isLocalMode && supabase) {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is okay
        health.checks.database = 'error'
        health.status = 'unhealthy'
      } else {
        health.checks.database = 'ok'
      }
    } catch (error) {
      health.checks.database = 'error'
      health.status = 'degraded'
    }
  } else {
    health.checks.database = 'local-mode'
  }

  health.responseTime = Date.now() - startTime

  const statusCode = health.status === 'healthy' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import PinPad from '@/components/PinPad'

export default function PinPage() {
  const router = useRouter()
  const { profile, unlock } = useApp()

  useEffect(() => {
    if (!profile) {
      router.push('/setup')
    }
  }, [profile, router])

  const handleSuccess = () => {
    unlock()
    router.push('/')
  }

  return (
    <PinPad
      onSuccess={handleSuccess}
      title="Enter PIN"
      subtitle="Enter your 4-digit PIN to continue"
    />
  )
}


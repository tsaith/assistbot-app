import { Session } from '@supabase/supabase-js'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { isSessionMissingError, logAuthEvent, forceLogout as utilsForceLogout } from '../lib/authUtils'
import { supabase } from '../lib/supabase'

interface SessionContextType {
  session: Session | null
  loading: boolean
  refreshSession: () => Promise<void>
  forceLogout: () => Promise<void>
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
  refreshSession: async () => {},
  forceLogout: async () => {},
})

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // 手動刷新 session 的函數
  const refreshSession = async () => {
    try {
      logAuthEvent('手動刷新 Session', '開始檢查當前狀態')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error && !isSessionMissingError(error)) {
        logAuthEvent('刷新錯誤', error.message)
        // 如果有錯誤，強制設置為無會話狀態
        setSession(null)
      } else {
        logAuthEvent('刷新完成', session ? '有活躍會話' : '無活躍會話')
        setSession(session)
      }
    } catch (error) {
      logAuthEvent('刷新異常', error instanceof Error ? error.message : '未知錯誤')
      // 異常情況下也設置為無會話狀態
      setSession(null)
    }
  }

  // 強制登出函數
  const forceLogout = async () => {
    try {
      // 使用工具函數清除本地存儲
      await utilsForceLogout()
      // 強制設置 session 為 null
      setSession(null)
      logAuthEvent('SessionProvider 強制登出', '已清除會話狀態')
    } catch (error) {
      logAuthEvent('強制登出失敗', error instanceof Error ? error.message : '未知錯誤')
      // 即使出錯也設置為 null
      setSession(null)
    }
  }

  useEffect(() => {
    let mounted = true

    // 取得當前 session
    const getInitialSession = async () => {
      try {
        console.log('取得初始 session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          if (isSessionMissingError(error)) {
            logAuthEvent('初始化', '沒有活躍會話（未登入狀態）')
          } else {
            logAuthEvent('初始化錯誤', error.message)
          }
          // 無論什麼錯誤，都設置為未登入狀態
          if (mounted) {
            setSession(null)
            setLoading(false)
          }
          return
        }
        
        console.log('初始 session:', session)
        if (mounted) {
          setSession(session)
          setLoading(false)
        }
      } catch (error) {
        console.error('初始化 session 錯誤:', error)
        if (mounted) {
          setSession(null)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // 監聽 auth 狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('onAuthStateChange:', event, session)
      
      if (!mounted) return
      
      // 處理不同的 auth 事件
      switch (event) {
        case 'SIGNED_IN':
          logAuthEvent('用戶登入', `用戶 ID: ${session?.user?.id}`)
          setSession(session)
          break
        case 'SIGNED_OUT':
          logAuthEvent('用戶登出', '登出成功')
          setSession(null)
          break
        case 'TOKEN_REFRESHED':
          logAuthEvent('Token 刷新', 'Session 已更新')
          setSession(session)
          break
        default:
          logAuthEvent('Auth 狀態變化', `事件: ${event}`)
          setSession(session)
      }
      
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <SessionContext.Provider value={{ session, loading, refreshSession, forceLogout }}>
      {children}
    </SessionContext.Provider>
  )
}

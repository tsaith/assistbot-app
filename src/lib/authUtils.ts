// 處理 Supabase Auth 錯誤的工具函數

export const isSessionMissingError = (error: any): boolean => {
  return (
    error?.name === 'AuthSessionMissingError' ||
    error?.message?.includes('Auth session missing') ||
    error?.message?.includes('session missing')
  )
}

export const handleAuthError = (error: any, operation: string = 'Auth操作'): void => {
  if (isSessionMissingError(error)) {
    console.log(`${operation}: 會話已失效，這是正常狀況`)
  } else {
    console.error(`${operation} 發生錯誤:`, error)
    throw error
  }
}

export const logAuthEvent = (event: string, details?: any): void => {
  const timestamp = new Date().toISOString()
  console.log(`🔐 [${timestamp}] ${event}`, details || '')
}

// 強制清除所有認證相關的本地存儲
export const forceLogout = async (): Promise<void> => {
  logAuthEvent('強制登出', '開始清除所有本地認證資料')
  
  try {
    // 清除 AsyncStorage (React Native)
    const AsyncStorage = require('@react-native-async-storage/async-storage').default
    const keys = await AsyncStorage.getAllKeys()
    const authKeys = keys.filter((key: string) => 
      key.includes('supabase') || 
      key.includes('auth') || 
      key.includes('session') ||
      key.includes('sb-')
    )
    
    for (const key of authKeys) {
      await AsyncStorage.removeItem(key)
      logAuthEvent('清除存儲', `已刪除: ${key}`)
    }
  } catch (asyncError) {
    logAuthEvent('AsyncStorage 清除失敗', asyncError instanceof Error ? asyncError.message : '未知錯誤')
  }
  
  try {
    // 清除 localStorage (Web)
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage)
      const authKeys = keys.filter((key: string) => 
        key.includes('supabase') || 
        key.includes('auth') || 
        key.includes('session') ||
        key.includes('sb-')
      )
      
      for (const key of authKeys) {
        localStorage.removeItem(key)
        logAuthEvent('清除存儲', `已刪除: ${key}`)
      }
    }
  } catch (localError) {
    logAuthEvent('localStorage 清除失敗', localError instanceof Error ? localError.message : '未知錯誤')
  }
  
  logAuthEvent('強制登出', '本地認證資料已清除')
}

import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { supabase } from '../../src/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('處理 OAuth 回調...')
        
        // 獲取當前 session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('OAuth 回調錯誤:', error)
          // 如果有錯誤，重定向到主頁面
          router.replace('/')
          return
        }
        
        if (session) {
          console.log('OAuth 登入成功，用戶 ID:', session.user.id)
          // 登入成功，重定向到主頁面
          router.replace('/')
        } else {
          console.log('OAuth 回調完成，但沒有 session')
          // 沒有 session，重定向到主頁面
          router.replace('/')
        }
      } catch (error) {
        console.error('處理 OAuth 回調時發生錯誤:', error)
        // 發生錯誤，重定向到主頁面
        router.replace('/')
      }
    }

    // 延遲一下處理，確保 Supabase 有時間處理回調
    const timer = setTimeout(handleAuthCallback, 1000)
    
    return () => clearTimeout(timer)
  }, [router])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>正在處理登入...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
})

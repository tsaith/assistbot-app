import { Session } from '@supabase/supabase-js'
import React from 'react'
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { isSessionMissingError, logAuthEvent } from '../lib/authUtils'
import { supabase } from '../lib/supabase'
import { useSession } from './SessionProvider'

interface MainProps {
  session: Session
  onNavigateToAccount: () => void
}

export default function Main({ session, onNavigateToAccount }: MainProps) {
  // 從 session 中取得用戶資訊
  const userEmail = session?.user?.email
  const userName = session?.user?.user_metadata?.full_name || userEmail
  
  // 取得 refreshSession 和 forceLogout 函數
  const { refreshSession, forceLogout: sessionForceLogout } = useSession()

  const handleLogout = async () => {
    try {
      console.log('開始登出流程...')
      console.log('當前 session:', session)
      
      // 定義實際的登出執行函數
      const performLogout = async () => {
        try {
          console.log('執行登出...')
          
          // 檢查當前是否有 session
          const { data: currentSession } = await supabase.auth.getSession()
          console.log('當前會話狀態:', currentSession)
          
          if (!currentSession.session) {
            console.log('沒有活躍會話，已經是登出狀態')
            // 如果沒有會話，表示已經登出了
            Alert.alert('提示', '您已經處於登出狀態')
            return
          }
          
          // 嘗試正常登出
          const { error } = await supabase.auth.signOut()
          
          if (error) {
            if (isSessionMissingError(error)) {
              logAuthEvent('登出完成', '會話已失效（正常情況）')
            } else {
              logAuthEvent('登出錯誤', error.message)
              throw error
            }
          } else {
            logAuthEvent('登出成功', '正常登出流程')
          }
          
          // 在手機平台上，強制清除會話並刷新狀態
          if (Platform.OS !== 'web') {
            // 嘗試更徹底的登出方式
            try {
              // 先嘗試使用 scope: 'global' 的登出方式
              await supabase.auth.signOut({ scope: 'global' })
              logAuthEvent('強制全域登出', '已執行全域登出')
            } catch (globalError) {
              logAuthEvent('全域登出失敗', globalError instanceof Error ? globalError.message : '未知錯誤')
            }
            
            // 等待狀態變化
            await new Promise(resolve => setTimeout(resolve, 200))
            
            // 如果仍然有活躍會話，使用強制登出
            const { data: { session: currentSession } } = await supabase.auth.getSession()
            if (currentSession) {
              logAuthEvent('檢測到殘留會話', '執行 SessionProvider 強制清除')
              await sessionForceLogout()
              // 再次等待並刷新
              await new Promise(resolve => setTimeout(resolve, 100))
            }
            
            // 手動刷新 session 確保 UI 更新
            await refreshSession()
          }
        } catch (innerError) {
          console.error('登出執行錯誤:', innerError)
          const errorMessage = innerError instanceof Error ? innerError.message : '未知錯誤'
          Alert.alert('登出失敗', `錯誤: ${errorMessage}`)
        }
      }
      
      if (Platform.OS !== 'web') {
        // 在手機上顯示確認對話框
        Alert.alert(
          '確認登出',
          '您確定要登出嗎？',
          [
            {
              text: '取消',
              style: 'cancel',
            },
            {
              text: '登出',
              style: 'destructive',
              onPress: performLogout,
            },
          ]
        )
      } else {
        // 在桌面版直接登出
        await performLogout()
      }
    } catch (error) {
      console.error('登出處理錯誤:', error)
      Alert.alert('登出失敗', '發生未知錯誤，請重試')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 主頁面標題 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Assistbot 主頁面</Text>
            <Text style={styles.subtitle}>歡迎使用 AI 助手應用</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text style={styles.logoutButtonText}>登出</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 用戶歡迎區域 */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          您好，{userName ? userName.split('@')[0] : '用戶'}！
        </Text>
        <Text style={styles.welcomeText}>
          這是您的個人 AI 助手控制台
        </Text>
      </View>

      {/* 主要功能區域 */}
      <View style={styles.mainContent}>
        <Text style={styles.sectionTitle}>主要功能</Text>
        
        {/* 即將推出的功能卡片 */}
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>🤖 AI 對話助手</Text>
          <Text style={styles.featureDescription}>
            與智能助手進行對話，獲得各種問題的解答
          </Text>
          <TouchableOpacity style={[styles.featureButton, styles.comingSoonButton]} disabled>
            <Text style={styles.comingSoonText}>即將推出</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>📝 智能筆記</Text>
          <Text style={styles.featureDescription}>
            讓 AI 幫助您整理和管理重要筆記
          </Text>
          <TouchableOpacity style={[styles.featureButton, styles.comingSoonButton]} disabled>
            <Text style={styles.comingSoonText}>即將推出</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>🔧 任務助手</Text>
          <Text style={styles.featureDescription}>
            AI 驅動的任務管理和提醒系統
          </Text>
          <TouchableOpacity style={[styles.featureButton, styles.comingSoonButton]} disabled>
            <Text style={styles.comingSoonText}>即將推出</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 帳號管理區域 */}
      <View style={styles.accountSection}>
        <Text style={styles.sectionTitle}>帳號管理</Text>
        <TouchableOpacity
          style={styles.accountButton}
          onPress={onNavigateToAccount}
        >
          <Text style={styles.accountButtonIcon}>⚙️</Text>
          <View style={styles.accountButtonContent}>
            <Text style={styles.accountButtonTitle}>個人設定</Text>
            <Text style={styles.accountButtonDescription}>
              管理您的個人資料、偏好設定和帳號資訊
            </Text>
          </View>
          <Text style={styles.accountButtonArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 應用資訊 */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>
          Assistbot v1.0.0 - 您的智能助手夥伴
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
  },
  mainContent: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  comingSoonButton: {
    backgroundColor: '#e9ecef',
  },
  comingSoonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  accountSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  accountButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  accountButtonContent: {
    flex: 1,
  },
  accountButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  accountButtonDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 18,
  },
  accountButtonArrow: {
    fontSize: 20,
    color: '#6c757d',
    marginLeft: 8,
  },
  appInfo: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'center',
  },
})

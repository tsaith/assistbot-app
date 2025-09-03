import { Session } from '@supabase/supabase-js'
import React from 'react'
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
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
    <ScrollView className="flex-1 bg-gray-50 pb-5">
      {/* 主頁面標題 */}
      <View className="bg-white py-10 px-5 border-b border-gray-200 shadow-sm">
        <View className="flex-row items-center justify-between w-full">
          <View className="flex-1 items-center">
            <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">Assistbot 主頁面</Text>
            <Text className="text-base text-gray-600 text-center">歡迎使用 AI 助手應用</Text>
          </View>
          <TouchableOpacity 
            className="bg-red-500 py-3 px-5 rounded-lg min-w-20 min-h-11 items-center justify-center shadow-sm"
            onPress={handleLogout}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text className="text-white text-base font-semibold">登出</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 用戶歡迎區域 */}
      <View className="bg-white mx-5 p-5 rounded-xl shadow-sm">
        <Text className="text-xl font-semibold text-gray-800 mb-2">
          您好，{userName ? userName.split('@')[0] : '用戶'}！
        </Text>
        <Text className="text-base text-gray-600 leading-6">
          這是您的個人 AI 助手控制台
        </Text>
      </View>

      {/* 主要功能區域 */}
      <View className="px-5 mb-5">
        <Text className="text-xl font-semibold text-gray-800 mb-4">主要功能</Text>
        
        {/* 即將推出的功能卡片 */}
        <View className="bg-white p-5 rounded-xl mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">🤖 AI 對話助手</Text>
          <Text className="text-sm text-gray-600 leading-5 mb-4">
            與智能助手進行對話，獲得各種問題的解答
          </Text>
          <TouchableOpacity className="py-2.5 px-4 rounded-lg bg-gray-200 items-center" disabled>
            <Text className="text-gray-600 text-sm font-medium">即將推出</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white p-5 rounded-xl mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">📝 智能筆記</Text>
          <Text className="text-sm text-gray-600 leading-5 mb-4">
            讓 AI 幫助您整理和管理重要筆記
          </Text>
          <TouchableOpacity className="py-2.5 px-4 rounded-lg bg-gray-200 items-center" disabled>
            <Text className="text-gray-600 text-sm font-medium">即將推出</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white p-5 rounded-xl mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">🔧 任務助手</Text>
          <Text className="text-sm text-gray-600 leading-5 mb-4">
            AI 驅動的任務管理和提醒系統
          </Text>
          <TouchableOpacity className="py-2.5 px-4 rounded-lg bg-gray-200 items-center" disabled>
            <Text className="text-gray-600 text-sm font-medium">即將推出</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 帳號管理區域 */}
      <View className="px-5 mb-5">
        <Text className="text-xl font-semibold text-gray-800 mb-4">帳號管理</Text>
        <TouchableOpacity
          className="bg-white py-4 px-5 rounded-xl flex-row items-center shadow-sm"
          onPress={onNavigateToAccount}
        >
          <Text className="text-2xl mr-4">⚙️</Text>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800 mb-1">個人設定</Text>
            <Text className="text-sm text-gray-600 leading-4">
              管理您的個人資料、偏好設定和帳號資訊
            </Text>
          </View>
          <Text className="text-xl text-gray-600 ml-2">›</Text>
        </TouchableOpacity>
      </View>

      {/* 應用資訊 */}
      <View className="px-5 items-center">
        <Text className="text-xs text-gray-400 text-center">
          Assistbot v1.0.0 - 您的智能助手夥伴
        </Text>
      </View>
    </ScrollView>
  )
}



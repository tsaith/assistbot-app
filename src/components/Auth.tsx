import * as WebBrowser from 'expo-web-browser'
import React, { useState } from 'react'
import { Alert, AppState, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../lib/supabase'


// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  async function signInWithEmail() {

    console.log('signInWithEmail', email, password)

    if (!email || !password) {
      Alert.alert('錯誤', '請填寫 Email 和密碼')
      return
    }

    console.log('t1')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    })

    console.log('t2')

    if (error) {
      Alert.alert('登入失敗', error.message)
    }
    setLoading(false)
  }

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('錯誤', '請填寫 Email 和密碼')
      return
    }

    if (password.length < 6) {
      Alert.alert('錯誤', '密碼至少需要 6 個字符')
      return
    }

    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    })

    if (error) {
      Alert.alert('註冊失敗', error.message)
    } else if (!session) {
      Alert.alert('註冊成功', '請檢查您的信箱並點擊驗證連結！')
    }
    setLoading(false)
  }

  async function signInWithGoogle() {
    try {
      setLoading(true)
      console.log('開始 Google 登入...')
      
      if (Platform.OS === 'web') {
        // Web 平台使用原有邏輯
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account'
            }
          }
        })
        
        if (error) {
          throw error
        }
      } else {
        // React Native 平台使用 expo-web-browser
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'assistbotapp://auth/callback',
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account'
            }
          }
        })
        
        if (error) {
          throw error
        }
        
        if (data.url) {
          // 使用 expo-web-browser 打開 OAuth URL
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            'assistbotapp://auth/callback'
          )
          
          if (result.type === 'success') {
            console.log('OAuth 回調成功:', result.url)
            // 處理回調 URL
            await supabase.auth.getSession()
          } else if (result.type === 'cancel') {
            console.log('用戶取消了 OAuth 流程')
          } else {
            console.log('OAuth 流程結果:', result.type)
          }
        }
      }
    } catch (error: any) {
      console.error('Google 登入錯誤:', error)
      Alert.alert('Google 登入失敗', error.message || '登入過程中發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 p-5 bg-white">
        <View className="bg-white rounded-xl p-6 mx-2 shadow-sm">
          <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
            {isSignUp ? '建立新帳號' : '登入您的帳號'}
          </Text>

          {/* Google 登入按鈕 */}
          <View className="pt-2 pb-2 self-stretch mt-5">
            <TouchableOpacity
              className="bg-white border border-gray-300 rounded-lg py-3 px-4 flex-row items-center justify-center shadow-sm"
              onPress={signInWithGoogle}
              disabled={loading}
            >
              <View className="bg-blue-500 w-6 h-6 rounded-full mr-3 items-center justify-center">
                <Text className="text-white text-sm font-bold">G</Text>
              </View>
              <Text className="text-gray-800 text-base font-medium">
                使用 Google 登入
              </Text>
            </TouchableOpacity>
          </View>

          {/* 分隔線 */}
          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-600 text-sm font-medium">或</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>
          
          <View className="pt-2 pb-2 self-stretch mt-5">
            <Text className="text-gray-800 text-base font-semibold mb-2">Email 信箱</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white text-gray-800"
              onChangeText={(text: string) => setEmail(text)}
              value={email}
              placeholder="請輸入您的 Email"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
          
          <View className="pt-2 pb-2 self-stretch">
            <Text className="text-gray-800 text-base font-semibold mb-2">密碼</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white text-gray-800"
              onChangeText={(text: string) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder={isSignUp ? "密碼至少 6 個字符" : "請輸入密碼"}
              autoCapitalize="none"
              autoComplete="password"
            />
          </View>
          
          <View className="pt-2 pb-2 self-stretch mt-8">
            <TouchableOpacity
              className={`rounded-lg py-4 items-center justify-center ${loading ? 'bg-gray-400 opacity-60' : 'bg-blue-500'}`}
              disabled={loading} 
              onPress={isSignUp ? signUpWithEmail : signInWithEmail}
            >
              <Text className="text-white text-base font-semibold">
                {loading ? '處理中...' : (isSignUp ? '註冊' : '登入')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View className="pt-2 pb-2 self-stretch">
            <TouchableOpacity
              className="py-3 items-center justify-center"
              disabled={loading} 
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text className="text-blue-500 text-base font-medium">
                {isSignUp ? '已有帳號？立即登入' : '還沒有帳號？立即註冊'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}


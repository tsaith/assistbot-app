import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('There is no EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY')
}

// 為 Web 平台創建簡單的 localStorage 適配器
const createWebStorage = () => {
  return {
    getItem: (key: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key) || null
        }
      } catch (error) {
        console.error('Error getting item from localStorage:', error)
      }
      return null
    },
    setItem: (key: string, value: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value)
        }
      } catch (error) {
        console.error('Error setting item to localStorage:', error)
      }
    },
    removeItem: (key: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key)
        }
      } catch (error) {
        console.error('Error removing item from localStorage:', error)
      }
    },
  }
}

// 為原生平台創建帶錯誤處理的 AsyncStorage 適配器
const createAsyncStorage = () => {
  return {
    getItem: async (key: string) => {
      try {
        const value = await AsyncStorage.getItem(key)
        return value
      } catch (error) {
        console.error('Error getting item from AsyncStorage:', error)
        return null
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        await AsyncStorage.setItem(key, value)
      } catch (error) {
        console.error('Error setting item to AsyncStorage:', error)
      }
    },
    removeItem: async (key: string) => {
      try {
        await AsyncStorage.removeItem(key)
      } catch (error) {
        console.error('Error removing item from AsyncStorage:', error)
      }
    },
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: Platform.OS === 'web' ? 'pkce' : 'implicit',
  },
})
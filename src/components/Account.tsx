import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../lib/supabase'

interface AccountProps {
  session: Session
  onBack?: () => void
}

export default function Account({ session, onBack }: AccountProps) {
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [timezone, setTimezone] = useState('Asia/Taipei')

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, first_name, last_name, timezone`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setFullName(data.full_name || '')
        setFirstName(data.first_name || '')
        setLastName(data.last_name || '')
        setTimezone(data.timezone || 'Asia/Taipei')
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    full_name,
    first_name,
    last_name,
    timezone,
  }: {
    full_name: string
    first_name: string
    last_name: string
    timezone: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        email: session?.user.email,
        full_name,
        first_name,
        last_name,
        timezone,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* 標題和返回按鈕 */}
      <View className="bg-white py-5 px-5 border-b border-gray-200 shadow-sm">
        {onBack && (
          <TouchableOpacity className="mb-2.5" onPress={onBack}>
            <Text className="text-base text-blue-500 font-medium">← 返回主頁</Text>
          </TouchableOpacity>
        )}
        <Text className="text-2xl font-bold text-gray-800 text-center">個人設定</Text>
      </View>

      <View className="bg-white mx-5 rounded-xl p-5 shadow-sm">
        <View className="pt-2 pb-2 self-stretch mt-5">
          <Text className="text-gray-800 text-base font-semibold mb-2">Email 信箱</Text>
          <TextInput 
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-100 text-gray-500"
            value={session?.user?.email || ''} 
            editable={false}
          />
        </View>
      
        <View className="pt-2 pb-2 self-stretch">
          <Text className="text-gray-800 text-base font-semibold mb-2">全名</Text>
          <TextInput 
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white text-gray-800"
            value={fullName || ''} 
            onChangeText={(text: string) => setFullName(text)}
            placeholder="請輸入您的全名"
          />
        </View>
      
        <View className="pt-2 pb-2 self-stretch">
          <Text className="text-gray-800 text-base font-semibold mb-2">名字</Text>
          <TextInput 
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white text-gray-800"
            value={firstName || ''} 
            onChangeText={(text: string) => setFirstName(text)}
            placeholder="請輸入您的名字"
          />
        </View>
      
        <View className="pt-2 pb-2 self-stretch">
          <Text className="text-gray-800 text-base font-semibold mb-2">姓氏</Text>
          <TextInput 
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white text-gray-800"
            value={lastName || ''} 
            onChangeText={(text: string) => setLastName(text)}
            placeholder="請輸入您的姓氏"
          />
        </View>
      
        <View className="pt-2 pb-2 self-stretch">
          <Text className="text-gray-800 text-base font-semibold mb-2">時區</Text>
          <TextInput 
            className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white text-gray-800"
            value={timezone || ''} 
            onChangeText={(text: string) => setTimezone(text)}
            placeholder="Asia/Taipei"
          />
        </View>

        <View className="pt-2 pb-2 self-stretch mt-5">
          <TouchableOpacity
            className={`rounded-lg py-4 items-center justify-center ${loading ? 'bg-gray-400 opacity-60' : 'bg-blue-500'}`}
            onPress={() => updateProfile({ 
              full_name: fullName, 
              first_name: firstName, 
              last_name: lastName, 
              timezone: timezone 
            })}
            disabled={loading}
          >
            <Text className="text-white text-base font-semibold">
              {loading ? '更新中...' : '更新個人資料'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="pt-2 pb-2 self-stretch">
          <TouchableOpacity 
            className="bg-red-500 rounded-lg py-4 items-center justify-center"
            onPress={() => supabase.auth.signOut()}
          >
            <Text className="text-white text-base font-semibold">登出</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}


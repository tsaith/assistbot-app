import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
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
    <View style={styles.container}>
      {/* 標題和返回按鈕 */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← 返回主頁</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>個人設定</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Text style={styles.inputLabel}>Email 信箱</Text>
          <TextInput 
            style={[styles.textInput, styles.disabledInput]}
            value={session?.user?.email || ''} 
            editable={false}
          />
        </View>
      
      <View style={styles.verticallySpaced}>
        <Text style={styles.inputLabel}>全名</Text>
        <TextInput 
          style={styles.textInput}
          value={fullName || ''} 
          onChangeText={(text: string) => setFullName(text)}
          placeholder="請輸入您的全名"
        />
      </View>
      
      <View style={styles.verticallySpaced}>
        <Text style={styles.inputLabel}>名字</Text>
        <TextInput 
          style={styles.textInput}
          value={firstName || ''} 
          onChangeText={(text: string) => setFirstName(text)}
          placeholder="請輸入您的名字"
        />
      </View>
      
      <View style={styles.verticallySpaced}>
        <Text style={styles.inputLabel}>姓氏</Text>
        <TextInput 
          style={styles.textInput}
          value={lastName || ''} 
          onChangeText={(text: string) => setLastName(text)}
          placeholder="請輸入您的姓氏"
        />
      </View>
      
      <View style={styles.verticallySpaced}>
        <Text style={styles.inputLabel}>時區</Text>
        <TextInput 
          style={styles.textInput}
          value={timezone || ''} 
          onChangeText={(text: string) => setTimezone(text)}
          placeholder="Asia/Taipei"
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity
          style={[styles.updateButton, loading && styles.disabledButton]}
          onPress={() => updateProfile({ 
            full_name: fullName, 
            first_name: firstName, 
            last_name: lastName, 
            timezone: timezone 
          })}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '更新中...' : '更新個人資料'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.verticallySpaced}>
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={() => supabase.auth.signOut()}
        >
          <Text style={styles.signOutButtonText}>登出</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
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
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verticallySpaced: {
    paddingTop: 8,
    paddingBottom: 8,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  inputLabel: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  disabledInput: {
    color: '#999',
    backgroundColor: '#f5f5f5',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
})
import React, { useState } from 'react'
import { Alert, AppState, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isSignUp ? '建立新帳號' : '登入您的帳號'}
          </Text>
          
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Text style={styles.inputLabel}>Email 信箱</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={(text: string) => setEmail(text)}
              value={email}
              placeholder="請輸入您的 Email"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
          
          <View style={styles.verticallySpaced}>
            <Text style={styles.inputLabel}>密碼</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={(text: string) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder={isSignUp ? "密碼至少 6 個字符" : "請輸入密碼"}
              autoCapitalize="none"
              autoComplete="password"
            />
          </View>
          
          <View style={[styles.verticallySpaced, styles.mt30]}>
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              disabled={loading} 
              onPress={isSignUp ? signUpWithEmail : signInWithEmail}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? '處理中...' : (isSignUp ? '註冊' : '登入')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.verticallySpaced}>
            <TouchableOpacity
              style={styles.secondaryButton}
              disabled={loading} 
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.secondaryButtonText}>
                {isSignUp ? '已有帳號？立即登入' : '還沒有帳號？立即註冊'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  verticallySpaced: {
    paddingTop: 8,
    paddingBottom: 8,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  mt30: {
    marginTop: 30,
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
  primaryButton: {
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
})
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Account from "../src/components/Account";
import Auth from "../src/components/Auth";
import Main from "../src/components/main";
import { useSession } from "../src/components/SessionProvider";

export default function Index() {
  const { session } = useSession();
  const [currentPage, setCurrentPage] = useState<'main' | 'account'>('main');

  // 當 session 變為 null 時，重置頁面狀態
  useEffect(() => {
    if (!session) {
      setCurrentPage('main');
    }
  }, [session]);

  if (!session) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>歡迎使用 Assistbot</Text>
          <Text style={styles.subtitle}>請登入或註冊來開始使用</Text>
        </View>
        <Auth />
      </ScrollView>
    );
  }

  // 根據當前頁面顯示不同的組件
  if (currentPage === 'account') {
    return <Account session={session} onBack={() => setCurrentPage('main')} />;
  }

  return (
    <Main 
      session={session} 
      onNavigateToAccount={() => setCurrentPage('account')} 
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

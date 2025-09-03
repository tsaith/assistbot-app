import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import "../global.css";
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
      <ScrollView className="flex-1 bg-gray-50">
        <View className="items-center py-10 bg-white border-b border-gray-200">
          <Text className="text-3xl font-bold text-gray-800 mb-2">歡迎使用 Assistbot</Text>
          <Text className="text-base text-gray-600 text-center">請登入或註冊來開始使用</Text>
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



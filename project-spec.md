
## 1. 專案概覽 (Project Overview)

Assistbot app 為您提供個人化智能助理，提供三種服務 1. 提醒使用者活動事件。 2. 從使用者的筆記，快速查詢資料。 3. 快速記帳與查詢收支紀錄。

下面是開發 Assistbot app 必須遵循的一些技術規範: 
- 使用 Expo 和 React Native 進行開發。
- 支援 Android 和 ios 手機。 

環境變數 BACKEND_SERVICE_URL 是雲端服務的網址。 

## 2. 技術棧 (Tech Stack)

- **框架 (Framework):** React Native
- **語言 (Language):** TypeScript
- **後端 & 資料庫 (Backend & Database):** SQLite
- **測試 (Testing):** Jest

## 3. 架構與目錄結構 (Architecture & Directory Structure)

專案採用以功能為導向的目錄結構

assistbot-app/
│── app/                     # Expo Router 
│   ├── (auth)/              # 分組路由 (登入/註冊等)
│   │   ├── signin.tsx
│   │   ├── signup.tsx
│   ├── (main)/              # 主功能區域
│   │   ├── home.tsx
│   │   ├── profile.tsx
│   ├── _layout.tsx          # expo-router layout
│   └── index.tsx
│
│── assets/                  # 靜態資源 (圖片 / 字體 / icon)
│   ├── images/
│   ├── fonts/
│   └── icons/
│
│── src/                     # 核心程式碼
│   ├── components/          # 可重用 UI 元件
│   │   ├── ui/              # 基礎元件 (Button, Text, Input)
│   │   └── layout/          # 較大元件 (Header, Card, Modal)
│   │
│   ├── hooks/               # 自定義 hooks (useAuth, useFetch, useTheme)
│   │
│   ├── context/             # React Context (AuthContext, ThemeContext)
│   │
│   ├── lib/            # 函式庫
│   │   ├── supabase.ts           # Supabase
│   │   ├── authService.ts        # 登入/註冊
│   │   └── paymentService.ts
│   │
│   ├── utils/               # 工具函式 (formatter, validator, constants)
│   │   ├── date.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   │
│   ├── store/               # 狀態管理 (Zustand / Redux)
│   │   └── userStore.ts
│   │
│   └── styles/              # 全域樣式 / theme
│       ├── colors.ts
│       └── typography.ts
│
│── .env.local               # 環境變數
│── app.json                 # Expo 設定
│── package.json


## 4. 開發慣例 (Development Conventions)

- **開發語言:**
    - 主要使用 TypeScript 進行開發。
    - 程式碼註解使用**英文**。
    - 需要中文內容時，使用**繁體中文**。
- **開發流程:**
    - 開發前，先分析需求並提出可能的做法。

## 5. 功能規格 (Functional Specification)


## 6. 測試 (Testing)

- **框架:** 使用 Jest 進行所有自動化測試。
- **位置:** 測試程式碼必須放在 `__tests__/` 目錄下。
- **登入測試:**
    - 當測試需要使用者登入時，**必須**使用 Email 和密碼的方式。
    - **測試帳號:**
        - **Email:** `testuser@example.com`
        - **Password:** `testuser@password`
    - **禁止**測試 Google OAuth 登入流程。


## 7. 其他 (Others)

- 請在 package.json 查看已安裝的套件。

# 自動化測試需求
- 請在 __tests__/ 資料夾中使用 Jest 編寫所有的自動化測試。

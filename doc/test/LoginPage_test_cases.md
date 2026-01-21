---
description: LoginPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】檢查初始顯示狀態
**範例輸入**： 渲染 `<LoginPage />`
**期待輸出**：
1. 顯示「歡迎回來」標題
2. 顯示 Email 輸入框 (type="text", placeholder="you@example.com")
3. 顯示密碼輸入框 (type="password")
4. 顯示「登入」按鈕 (Enabled)

---

## [x] 【function 邏輯】驗證無效 Email 格式
**範例輸入**： 在 Email 欄位輸入 `invalid-email`，點擊登入
**期待輸出**：
1. Email 輸入框下方顯示錯訊訊息「請輸入有效的 Email 格式」
2. 不觸發 `login` 函式

---

## [x] 【function 邏輯】驗證密碼長度不足
**範例輸入**： 在密碼欄位輸入 `1234567` (7碼)，點擊登入
**期待輸出**：
1. 密碼輸入框下方顯示錯誤訊息「密碼必須至少 8 個字元」
2. 不觸發 `login` 函式

---

## [x] 【function 邏輯】驗證密碼缺少英數組合
**範例輸入**： 在密碼欄位輸入 `12345678` (全數字) 或 `abcdefgh` (全英文)，點擊登入
**期待輸出**：
1. 密碼輸入框下方顯示錯誤訊息「密碼必須包含英文字母和數字」
2. 不觸發 `login` 函式

---

## [x] 【function 邏輯】檢查 Loading 狀態與按鈕鎖定
**範例輸入**： 輸入有效 Email 與密碼，點擊登入 (模擬 API 延遲)
**期待輸出**：
1. 按鈕文字變為「登入中...」
2. 按鈕設為 `disabled`
3. Email 與密碼輸入框設為 `disabled`

---

## [x] 【Mock API】處理登入失敗 (API 錯誤)
**範例輸入**： 輸入有效 Email 與密碼，模擬 `login` 拋出 `AxiosError` (message: "帳號或密碼錯誤")
**期待輸出**：
1. 顯示錯誤 Banner，內容包含「帳號或密碼錯誤」
2. Loading 狀態解除

---

## [x] 【Mock API】成功登入導向
**範例輸入**： 輸入有效 Email 與密碼，模擬 `login` 成功
**期待輸出**：
1. 呼叫 `navigate('/dashboard', { replace: true })`

---

## [x] 【驗證權限】已登入自動導向
**範例輸入**： 模擬 `useAuth` 回傳 `isAuthenticated: true`，渲染 `<LoginPage />`
**期待輸出**：
1. 直接呼叫 `navigate('/dashboard', { replace: true })`

---

## [x] 【frontend 邏輯】顯示登入過期訊息
**範例輸入**： 模擬 `useAuth` 回傳 `authExpiredMessage: "登入已過期"`
**期待輸出**：
1. 顯示錯誤 Banner，內容為 "登入已過期"
2. 呼叫 `clearAuthExpiredMessage`

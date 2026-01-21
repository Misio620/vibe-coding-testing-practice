---
description: DashboardPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【Mock API】渲染 Loading 狀態
**範例輸入**： `productApi.getProducts` 回傳 Promise (未 resolve)，渲染 `<DashboardPage />`
**期待輸出**：
1. 顯示「載入商品中...」
2. 顯示 Loading Spinner
3. 不顯示商品列表
4. 不顯示錯誤訊息

---

## [x] 【Mock API】渲染商品列表 (API 成功)
**範例輸入**： `productApi.getProducts` resolve 回傳 `[ { id: 1, name: 'Test Product', price: 100, description: 'Desc' } ]`
**期待輸出**：
1. Loading 消失
2. 顯示商品列表區塊
3. 顯示商品名稱 "Test Product"
4. 顯示價格 "NT$ 100"
5. 顯示描述 "Desc"

---

## [x] 【Mock API】渲染錯誤狀態 (一般錯誤)
**範例輸入**： `productApi.getProducts` reject 回傳 `AxiosError` (message: "API Error")
**期待輸出**：
1. Loading 消失
2. 顯示錯誤訊息 "API Error"
3. 不顯示商品列表

---

## [x] 【Mock API】Token 過期錯誤 (401)
**範例輸入**： `productApi.getProducts` reject 回傳 `AxiosError` (status: 401)
**期待輸出**：
1. Loading 消失
2. 不顯示錯誤訊息 (由 interceptor 處理，這裡應驗證不顯示一般錯誤)
3. (選擇性) 驗證是否不做額外處理 (因為 interceptor 會導向)

---

## [x] 【前端元素】檢查 Header 與 User Info
**範例輸入**： `useAuth` 回傳 `user: { username: 'TestUser', role: 'user' }`
**期待輸出**：
1. 顯示 "Welcome, TestUser 👋"
2. Role Badge 顯示 "一般用戶"
3. Header 顯示 "儀表板"
4. 導航列 **不顯示** "管理後台" 連結

---

## [x] 【前端元素】檢查 Admin 連結 (Admin Role)
**範例輸入**： `useAuth` 回傳 `user: { role: 'admin' }`
**期待輸出**：
1. 導航列 **顯示** "管理後台" 連結
2. Role Badge 顯示 "管理員"

---

## [x] 【function 邏輯】處理登出
**範例輸入**： 點擊「登出」按鈕
**期待輸出**：
1. 呼叫 `logout`
2. `navigate('/login', ...)`被呼叫

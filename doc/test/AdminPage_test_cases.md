---
description: AdminPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】檢查初始顯示狀態
**範例輸入**： 模擬 `useAuth` 回傳 `user: { role: 'admin', username: 'Admin' }`，渲染 `<AdminPage />`
**期待輸出**：
1. 顯示「管理後台」標題
2. 顯示「← 返回」連結 (to="/dashboard")
3. 顯示 Role Badge 為「管理員」
4. 顯示「登出」按鈕
5. 顯示 Admin Feature 區塊 (包含管理員專屬頁面標題)

---

## [x] 【function 邏輯】處理登出
**範例輸入**： 點擊「登出」按鈕
**期待輸出**：
1. 呼叫 `logout` 函式
2. 呼叫 `navigate('/login', { replace: true, state: null })`

---

## [x] 【前端元素】檢查角色Badge顯示 (Admin)
**範例輸入**： 模擬 `useAuth` 回傳 `user: { role: 'admin' }`
**期待輸出**：
1. Role Badge 顯示「管理員」
2. Role Badge class 包含 `admin`

---

## [x] 【前端元素】檢查角色Badge顯示 (User)
**範例輸入**： 模擬 `useAuth` 回傳 `user: { role: 'user' }` (雖然此頁面應被守衛擋下，但作為單元測試仍需驗證 UI 渲染邏輯)
**期待輸出**：
1. Role Badge 顯示「一般用戶」
2. Role Badge class 包含 `user`

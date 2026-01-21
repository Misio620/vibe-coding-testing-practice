
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../LoginPage';
import { BrowserRouter } from 'react-router-dom';
import * as AuthContextModule from '../../context/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock AuthContext
const mockLogin = vi.fn();
const mockClearAuthExpiredMessage = vi.fn();

const renderLoginPage = (authContextValue = {}) => {
    const defaultAuthContext = {
        login: mockLogin,
        isAuthenticated: false,
        authExpiredMessage: '',
        clearAuthExpiredMessage: mockClearAuthExpiredMessage,
        ...authContextValue,
    };

    // Spy on useAuth to return our mock values
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue(defaultAuthContext as any);

    return render(
        <BrowserRouter>
            <LoginPage />
        </BrowserRouter>
    );
};

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('前端元素', () => {
        it('檢查初始顯示狀態', () => {
            renderLoginPage();

            expect(screen.getByText('歡迎回來')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('至少 8 個字元，需包含英數')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登入' })).toBeEnabled();
        });
    });

    describe('function 邏輯', () => {
        it('驗證無效 Email 格式', async () => {
            renderLoginPage();

            const emailInput = screen.getByPlaceholderText('you@example.com');
            const loginButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();
            });
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('驗證密碼長度不足', async () => {
            renderLoginPage();

            const passwordInput = screen.getByPlaceholderText('至少 8 個字元，需包含英數');
            const loginButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(passwordInput, { target: { value: '1234567' } });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();
            });
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('驗證密碼缺少英數組合', async () => {
            renderLoginPage();

            const passwordInput = screen.getByPlaceholderText('至少 8 個字元，需包含英數');
            const loginButton = screen.getByRole('button', { name: '登入' });

            // Case 1: Numbers only
            fireEvent.change(passwordInput, { target: { value: '12345678' } });
            fireEvent.click(loginButton);
            await waitFor(() => {
                expect(screen.getByText('密碼必須包含英文字母，343525和數字')).toBeInTheDocument();
            });

            // Case 2: Letters only
            fireEvent.change(passwordInput, { target: { value: 'abcdefgh' } });
            fireEvent.click(loginButton);
            await waitFor(() => {
                expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
            });

            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('檢查 Loading 狀態與按鈕鎖定', async () => {
            // Mock login to not resolve immediately to check loading state
            mockLogin.mockImplementation(() => new Promise(() => { }));

            renderLoginPage();

            const emailInput = screen.getByPlaceholderText('you@example.com');
            const passwordInput = screen.getByPlaceholderText('至少 8 個字元，需包含英數');
            const loginButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });

            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(screen.getByText('登入中...')).toBeInTheDocument();
                expect(loginButton).toBeDisabled();
                expect(emailInput).toBeDisabled();
                expect(passwordInput).toBeDisabled();
            });
        });
    });

    describe('Mock API', () => {
        it('處理登入失敗 (API 錯誤)', async () => {
            const error = {
                isAxiosError: true,
                response: {
                    data: {
                        message: '帳號或密碼錯誤'
                    }
                }
            };
            mockLogin.mockRejectedValue(error);

            renderLoginPage();

            const emailInput = screen.getByPlaceholderText('you@example.com');
            const passwordInput = screen.getByPlaceholderText('至少 8 個字元，需包含英數');
            const loginButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });

            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(screen.getByText('帳號或密碼錯誤')).toBeInTheDocument();
            });
            expect(screen.queryByText('登入中...')).not.toBeInTheDocument();
        });

        it('成功登入導向', async () => {
            mockLogin.mockResolvedValue(undefined);

            renderLoginPage();

            const emailInput = screen.getByPlaceholderText('you@example.com');
            const passwordInput = screen.getByPlaceholderText('至少 8 個字元，需包含英數');
            const loginButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });

            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });
    });

    describe('驗證權限', () => {
        it('已登入自動導向', () => {
            renderLoginPage({ isAuthenticated: true });
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });

    describe('frontend 邏輯', () => {
        it('顯示登入過期訊息', () => {
            renderLoginPage({ authExpiredMessage: '登入已過期' });

            expect(screen.getByText('登入已過期')).toBeInTheDocument();
            expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
        });
    });
});

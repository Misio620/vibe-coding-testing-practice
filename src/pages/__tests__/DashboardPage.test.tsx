
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DashboardPage } from '../DashboardPage';
import { BrowserRouter } from 'react-router-dom';
import * as AuthContextModule from '../../context/AuthContext';
import { productApi } from '../../api/productApi';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock productApi
vi.mock('../../api/productApi', () => ({
    productApi: {
        getProducts: vi.fn(),
    },
}));

// Mock AuthContext
const mockLogout = vi.fn();

const renderDashboardPage = (user = { role: 'user', username: 'TestUser' }) => {
    const defaultAuthContext = {
        user: user,
        logout: mockLogout,
        isAuthenticated: true,
    };

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue(defaultAuthContext as any);

    return render(
        <BrowserRouter>
            <DashboardPage />
        </BrowserRouter>
    );
};

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Mock API', () => {
        it('渲染 Loading 狀態', async () => {
            // Mock to return a pending promise
            (productApi.getProducts as any).mockReturnValue(new Promise(() => { }));

            renderDashboardPage();

            expect(screen.getByText('載入商品中...')).toBeInTheDocument();
            expect(screen.queryByText('商品列表')).toBeInTheDocument(); // section header
        });

        it('渲染商品列表 (API 成功)', async () => {
            const mockProducts = [
                { id: 1, name: 'Test Product', price: 100, description: 'Desc' }
            ];
            (productApi.getProducts as any).mockResolvedValue(mockProducts);

            renderDashboardPage();

            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });

            expect(screen.getByText('Test Product')).toBeInTheDocument();
            expect(screen.getByText('NT$ 100')).toBeInTheDocument();
            expect(screen.getByText('Desc')).toBeInTheDocument();
        });

        it('渲染錯誤狀態 (一般錯誤)', async () => {
            const error = {
                isAxiosError: true,
                response: {
                    data: {
                        message: 'API Error'
                    }
                }
            };
            (productApi.getProducts as any).mockRejectedValue(error);

            renderDashboardPage();

            await waitFor(() => {
                expect(screen.getByText('API Error')).toBeInTheDocument();
            });
            expect(screen.queryByText('loading_spinner')).not.toBeInTheDocument();
        });

        it('Token 過期錯誤 (401)', async () => {
            const error = {
                isAxiosError: true,
                response: {
                    status: 401
                }
            };
            (productApi.getProducts as any).mockRejectedValue(error);

            renderDashboardPage();

            // Wait for potential effects
            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });

            // Should not show error message because it's handled (ignored in component, handled by interceptor)
            expect(screen.queryByText('無法載入商品資料')).not.toBeInTheDocument();
        });
    });

    describe('前端元素', () => {
        it('檢查 Header 與 User Info', async () => {
            (productApi.getProducts as any).mockResolvedValue([]);
            renderDashboardPage({ role: 'user', username: 'TestUser' });

            await waitFor(() => {
                expect(screen.getByText('Welcome, TestUser 👋')).toBeInTheDocument();
            });

            expect(screen.getByText('一般用戶')).toBeInTheDocument();
            expect(screen.getByText('儀表板')).toBeInTheDocument();
            expect(screen.queryByText('管理後台')).not.toBeInTheDocument();
        });

        it('檢查 Admin 連結 (Admin Role)', async () => {
            (productApi.getProducts as any).mockResolvedValue([]);
            renderDashboardPage({ role: 'admin', username: 'Admin' });

            await waitFor(() => {
                expect(screen.getByText(/管理後台/)).toBeInTheDocument();
            });
            expect(screen.getByText('管理員')).toBeInTheDocument();
        });
    });

    describe('function 邏輯', () => {
        it('處理登出', async () => {
            (productApi.getProducts as any).mockResolvedValue([]);
            renderDashboardPage();

            await waitFor(() => screen.getByRole('button', { name: '登出' }));

            const logoutButton = screen.getByRole('button', { name: '登出' });
            fireEvent.click(logoutButton);

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });
});

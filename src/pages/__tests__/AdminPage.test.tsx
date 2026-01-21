
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminPage } from '../AdminPage';
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
const mockLogout = vi.fn();

const renderAdminPage = (userRole = 'admin') => {
    const defaultAuthContext = {
        user: { role: userRole, username: 'TestUser' },
        logout: mockLogout,
        isAuthenticated: true,
    };

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue(defaultAuthContext as any);

    return render(
        <BrowserRouter>
            <AdminPage />
        </BrowserRouter>
    );
};

describe('AdminPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('前端元素', () => {
        it('檢查初始顯示狀態', () => {
            renderAdminPage('admin');

            expect(screen.getByText(/管理後台/)).toBeInTheDocument();
            expect(screen.getByText('← 返回')).toBeInTheDocument();
            expect(screen.getByText('管理員')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
            expect(screen.getByText('管理員專屬頁面')).toBeInTheDocument();
        });

        it('檢查角色Badge顯示 (Admin)', () => {
            renderAdminPage('admin');
            const badge = screen.getByText('管理員');
            expect(badge).toHaveClass('admin');
        });

        it('檢查角色Badge顯示 (User)', () => {
            renderAdminPage('user');
            const badge = screen.getByText('一般用戶');
            expect(badge).toHaveClass('user');
        });
    });

    describe('function 邏輯', () => {
        it('處理登出', () => {
            renderAdminPage();

            const logoutButton = screen.getByRole('button', { name: '登出' });
            fireEvent.click(logoutButton);

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });
});

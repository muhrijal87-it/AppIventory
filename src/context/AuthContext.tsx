import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, ActivityLog } from '../types';
import { mysql } from '../db/mysqlEngine';

export type AppPermission =
  | 'manage_users'
  | 'reset_db'
  | 'restore_db'
  | 'backup_db'
  | 'query_db'
  | 'manage_inventory'
  | 'delete_inventory'
  | 'manage_master_data'
  | 'delete_master_data'
  | 'view_reports'
  | 'export_reports'
  | 'view_audit_logs';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  users: User[];
  login: (username: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (nama_lengkap: string, email: string) => boolean;
  changePassword: (oldPass: string, newPass: string) => boolean;
  addUser: (userData: Omit<User, 'id' | 'created_at'>) => boolean;
  updateUser: (id: number, userData: Partial<User>) => boolean;
  deleteUser: (id: number) => boolean;
  toggleUserStatus: (id: number) => boolean;
  logActivity: (action: string, module: string, detail: string) => void;
  can: (action: AppPermission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_SESSION_KEY = 'ci_session_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load users from DB state
    const state = mysql.getState();
    setUsers(state.users);

    // Check existing active session
    const saved = localStorage.getItem(CURRENT_USER_SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Verify user still exists in DB
        const match = state.users.find((u) => u.id === parsed.id && u.is_active);
        if (match) {
          setUser(match);
        } else {
          localStorage.removeItem(CURRENT_USER_SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(CURRENT_USER_SESSION_KEY);
      }
    }
  }, []);

  const logActivity = (action: string, module: string, detail: string) => {
    const state = mysql.getState();
    const newLog: ActivityLog = {
      id: Date.now(),
      user_id: user ? user.id : 1,
      username: user ? user.username : 'system',
      action,
      module,
      detail,
      ip_address: '127.0.0.1',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    state.activity_logs.unshift(newLog);
    mysql.setState({ ...state });
  };

  const login = async (username: string): Promise<{ success: boolean; message: string }> => {
    const t0 = performance.now();
    const state = mysql.getState();
    const match = state.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());

    if (!match) {
      mysql.logQuery(`SELECT * FROM tbl_users WHERE username = '${username}' LIMIT 1`, performance.now() - t0, 0);
      return { success: false, message: 'Nama pengguna (username) tidak ditemukan dalam database!' };
    }

    if (!match.is_active) {
      return { success: false, message: 'Akun Anda sedang dinonaktifkan oleh Administrator. Hubungi admin sistem.' };
    }

    // Update last login
    const updatedUser: User = {
      ...match,
      last_login: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    const updatedUsers = state.users.map((u) => (u.id === match.id ? updatedUser : u));
    mysql.setState({
      ...state,
      users: updatedUsers,
    });
    setUsers(updatedUsers);
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(updatedUser));

    const duration = performance.now() - t0;
    mysql.logQuery(`UPDATE tbl_users SET last_login = NOW() WHERE id = ${match.id}`, duration, 1);
    logActivity('AUTH_LOGIN', 'AUTENTIKASI', `Pengguna ${match.username} berhasil login ke sistem`);

    return { success: true, message: `Selamat datang kembali, ${match.nama_lengkap}!` };
  };

  const logout = () => {
    if (user) {
      logActivity('AUTH_LOGOUT', 'AUTENTIKASI', `Pengguna ${user.username} mengakhiri sesi (logout)`);
    }
    setUser(null);
    localStorage.removeItem(CURRENT_USER_SESSION_KEY);
  };

  const updateProfile = (nama_lengkap: string, email: string): boolean => {
    if (!user) return false;
    const t0 = performance.now();
    const state = mysql.getState();
    const updatedUser = { ...user, nama_lengkap, email };

    const updatedUsers = state.users.map((u) => (u.id === user.id ? updatedUser : u));
    mysql.setState({ ...state, users: updatedUsers });
    setUsers(updatedUsers);
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(updatedUser));

    mysql.logQuery(`UPDATE tbl_users SET nama_lengkap = '${nama_lengkap}', email = '${email}' WHERE id = ${user.id}`, performance.now() - t0, 1);
    logActivity('UPDATE_PROFILE', 'USER_PROFILE', `Memperbarui profil akun ${user.username}`);
    return true;
  };

  const changePassword = (_oldPass: string, _newPass: string): boolean => {
    if (!user) return false;
    const t0 = performance.now();
    mysql.logQuery(`UPDATE tbl_users SET password_hash = '***' WHERE id = ${user.id}`, performance.now() - t0, 1);
    logActivity('CHANGE_PASSWORD', 'AUTENTIKASI', `Pengguna ${user.username} mengganti kata sandi`);
    return true;
  };

  const addUser = (userData: Omit<User, 'id' | 'created_at'>): boolean => {
    const t0 = performance.now();
    const state = mysql.getState();
    const newId = state.users.length > 0 ? Math.max(...state.users.map((u) => u.id)) + 1 : 1;
    const newUser: User = {
      ...userData,
      id: newId,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    const updatedUsers = [...state.users, newUser];
    mysql.setState({ ...state, users: updatedUsers });
    setUsers(updatedUsers);

    mysql.logQuery(`INSERT INTO tbl_users (username, nama_lengkap, email, role, is_active) VALUES ('${newUser.username}', '${newUser.nama_lengkap}', '${newUser.email}', '${newUser.role}', ${newUser.is_active ? 1 : 0})`, performance.now() - t0, 1);
    logActivity('INSERT_USER', 'USER_MANAGEMENT', `Menambahkan akun pengguna baru: ${newUser.username} (${newUser.role})`);
    return true;
  };

  const updateUser = (id: number, userData: Partial<User>): boolean => {
    const t0 = performance.now();
    const state = mysql.getState();
    const updatedUsers = state.users.map((u) => (u.id === id ? { ...u, ...userData } : u));
    mysql.setState({ ...state, users: updatedUsers });
    setUsers(updatedUsers);

    if (user && user.id === id) {
      const activeUpdated = updatedUsers.find((u) => u.id === id);
      if (activeUpdated) {
        setUser(activeUpdated);
        localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(activeUpdated));
      }
    }

    mysql.logQuery(`UPDATE tbl_users SET ... WHERE id = ${id}`, performance.now() - t0, 1);
    logActivity('UPDATE_USER', 'USER_MANAGEMENT', `Memperbarui data pengguna ID #${id}`);
    return true;
  };

  const deleteUser = (id: number): boolean => {
    if (user && user.id === id) return false; // Prevent self deletion
    const t0 = performance.now();
    const state = mysql.getState();
    const target = state.users.find((u) => u.id === id);
    const updatedUsers = state.users.filter((u) => u.id !== id);

    mysql.setState({ ...state, users: updatedUsers });
    setUsers(updatedUsers);

    mysql.logQuery(`DELETE FROM tbl_users WHERE id = ${id}`, performance.now() - t0, 1);
    logActivity('DELETE_USER', 'USER_MANAGEMENT', `Menghapus akun pengguna: ${target?.username || id}`);
    return true;
  };

  const toggleUserStatus = (id: number): boolean => {
    if (user && user.id === id) return false;
    const target = users.find((u) => u.id === id);
    if (!target) return false;
    return updateUser(id, { is_active: !target.is_active });
  };

  /**
   * Role-Based Access Control (RBAC) Permission Matrix
   * - admin: Full unrestricted access
   * - staff: Operational warehouse (inventory transactions & additions, view reports)
   * - manager: Executive oversight (reports, exports, audit logs, backup downloads)
   */
  const can = (action: AppPermission): boolean => {
    if (!user) return false;
    if (!user.is_active) return false;

    // 1. Administrator: Full Access
    if (user.role === 'admin') return true;

    // 2. Staff Gudang (Petugas Operasional Logistik)
    if (user.role === 'staff') {
      switch (action) {
        case 'manage_inventory':   // Inbound, Outbound, Transfer, Add/Edit Item
        case 'manage_master_data': // Add/Edit Category, Departemen, Satuan, Supplier
        case 'view_reports':       // View Stock position and transactions
          return true;
        case 'delete_inventory':   // Restrict deletion to Administrator
        case 'delete_master_data': // Restrict deletion to Administrator
        case 'manage_users':
        case 'reset_db':
        case 'restore_db':
        case 'query_db':
        case 'backup_db':
        case 'export_reports':
        case 'view_audit_logs':
        default:
          return false;
      }
    }

    // 3. Manajer Operasional (Pimpinan / Auditor)
    if (user.role === 'manager') {
      switch (action) {
        case 'view_reports':     // Read-only stock and transactions
        case 'export_reports':   // Export CSV, Excel, Print PDF
        case 'view_audit_logs':  // View security audit trail
        case 'backup_db':        // Download SQL backup file for audit
          return true;
        case 'manage_inventory': // Prevent daily stock edits by manager
        case 'delete_inventory':
        case 'manage_master_data':
        case 'delete_master_data':
        case 'manage_users':
        case 'reset_db':
        case 'restore_db':
        case 'query_db':
        default:
          return false;
      }
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        users,
        login,
        logout,
        updateProfile,
        changePassword,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        logActivity,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

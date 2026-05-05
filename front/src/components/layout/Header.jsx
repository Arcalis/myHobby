import { Link, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { User, LogOut, Settings } from 'lucide-react';
import { LoginDialog } from '../auth/LoginDialog';
import { useState } from 'react';
import { RegisterDialog } from '../auth/RegisterDialog';
export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  const navLinks = [
    { path: '/', label: 'Главная' },
    { path: '/events', label: 'Мероприятия' },
  ];
  return (<>
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">ОП</span>
            </div>
            <span className="font-semibold text-foreground">Образовательные программы</span>
          </Link>

          {/* Навигация */}
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (<Link key={link.path} to={link.path} className={`text-sm transition-colors ${isActive(link.path)
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'}`}>
              {link.label}
            </Link>))}
          </nav>

          {/* Правая часть */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (<>
              {user.role === 'admin' && (<Link to="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Админ-панель
                </Button>
              </Link>)}
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  {user.name}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Выйти
              </Button>
            </>) : (<Button onClick={() => setShowLoginDialog(true)} className="gap-2">
              <User className="w-4 h-4" />
              Войти
            </Button>)}
          </div>
        </div>
      </div>
    </header>

    <LoginDialog
      open={showLoginDialog}
      onOpenChange={setShowLoginDialog}
      onSwitchToRegister={() => {
        setShowLoginDialog(false);
        setShowRegisterDialog(true);
      }}
    />

    <RegisterDialog
      open={showRegisterDialog}
      onOpenChange={setShowRegisterDialog}
    />
  </>);
}

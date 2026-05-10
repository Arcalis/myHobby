import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useAuth } from '../../context/AuthContext';
import { RegisterDialog } from '../auth/RegisterDialog.jsx';
export function LoginDialog({ open, onOpenChange, onSwitchToRegister }) {
const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // null | 'not_found' | 'wrong_password'
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      onOpenChange(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      const status = err?.status ?? err?.response?.status;
      if (status === 404) setError('not_found');
      else if (status === 400) setError('wrong_password');
      else setError('wrong_password'); // fallback
    }
  };

  const emailError = error === 'not_found';
  const passwordError = error === 'wrong_password' || error === 'not_found';


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Вход в личный кабинет</DialogTitle>
          <DialogDescription className="pt-2">
            Войдите в систему, чтобы получить доступ к регистрации на мероприятия и личному кабинету.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email" type="email" placeholder="example@email.com"
              value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }}
              required
              className={`border bg-input-background ${emailError ? 'border-red-500 focus-visible:ring-red-500' : 'border-border'}`}
            />
            {emailError && <p className="text-xs text-red-500">Пользователь с таким email не найден</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password" type="password" placeholder="Введите пароль"
              value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }}
              required
              className={`border bg-input-background ${passwordError ? 'border-red-500 focus-visible:ring-red-500' : 'border-border'}`}
            />
            {error === 'wrong_password' && <p className="text-xs text-red-500">Неверный пароль</p>}
          </div>

        <div className="pt-2 space-y-3">
          <Button type="submit" className="w-full">
            Войти
          </Button>

          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
            <p className="font-medium mb-2">Еще нет аккаунта?</p>
            <Button type="button" onClick={onSwitchToRegister} className="gap-2">
                  Регистрация
            </Button>
          </div>
        </div>
      </form>
    </DialogContent>
  </Dialog>);
}

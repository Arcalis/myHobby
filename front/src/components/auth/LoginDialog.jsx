import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useAuth } from '../../context/AuthContext';
export function LoginDialog({ open, onOpenChange }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const handleSubmit = (e) => {
        e.preventDefault();
        login(email, password);
        onOpenChange(false);
        setEmail('');
        setPassword('');
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
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
            <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="border border-border bg-input-background"/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" placeholder="Введите пароль" value={password} onChange={(e) => setPassword(e.target.value)} required className="border border-border bg-input-background"/>
          </div>

          <div className="pt-2 space-y-3">
            <Button type="submit" className="w-full">
              Войти
            </Button>
            
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <p className="font-medium mb-2">Демо-доступ:</p>
              <p>• Обычный пользователь: любой email</p>
              <p>• Организатор: organizer@example.com</p>
              <p>• Администратор: admin@example.com</p>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>);
}

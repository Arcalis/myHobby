import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useAuth } from '../../context/AuthContext';
export function RegisterDialog({ open, onOpenChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [first_name, setFirstName] = useState('');
  const [second_name, setSecondName] = useState('');
  const [emailError, setEmailError] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError(false);
    try {
      await register(email, password, first_name, second_name);
      onOpenChange(false);
      setFirstName(''); setSecondName(''); setEmail(''); setPassword('');
    } catch (err) {
      const status = err?.status ?? err?.response?.status;
      if (status === 400) setEmailError(true);
    }
  };

  return (<Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Регистрация нового пользователя</DialogTitle>
        <DialogDescription className="pt-2">
          Создайте аккаунт, чтобы получить доступ к регистрации на мероприятия и личному кабинету.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Введите имя</Label>
          <Input id="first_name" type="first_name" placeholder="Иван" value={first_name} onChange={(e) => setFirstName(e.target.value)} required className="border border-border bg-input-background" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="second_name">Введите фамилию</Label>
          <Input id="second_name" type="second_name" placeholder="Иванов" value={second_name} onChange={(e) => setSecondName(e.target.value)} required className="border border-border bg-input-background" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email" type="email" placeholder="example@email.com"
            value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(false); }}
            required
            className={`border bg-input-background ${emailError ? 'border-red-500 focus-visible:ring-red-500' : 'border-border'}`}
          />
          {emailError && <p className="text-xs text-red-500">Пользователь с таким email уже существует</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <Input id="password" type="password" placeholder="Введите пароль" value={password} onChange={(e) => setPassword(e.target.value)} required className="border border-border bg-input-background" />
        </div>

        <div className="pt-2 space-y-3">
          <Button type="submit" className="w-full">
            Зарегистрироваться
          </Button>

        </div>
      </form>
    </DialogContent>
  </Dialog>);
}

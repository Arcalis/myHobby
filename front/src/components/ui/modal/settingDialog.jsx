import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog';
import { Input } from '../input';
import { Button } from '../button';
import { Label } from '../label';
import { apiRequest } from '../../../api/client';

export function SettingsDialog({ open, onOpenChange, user, onUpdated }) {
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    second_name: user?.second_name || '',
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: null, general: null }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (form.newPassword || form.confirmPassword || form.currentPassword) {
      if (!form.currentPassword) return setErrors({ currentPassword: 'Введите текущий пароль' });
      if (!form.newPassword) return setErrors({ newPassword: 'Введите новый пароль' });
      if (form.newPassword !== form.confirmPassword)
        return setErrors({ confirmPassword: 'Пароли не совпадают' });
    }

    try {
      setLoading(true);
      const payload = {
        first_name: form.first_name,
        second_name: form.second_name,
        name: form.name,
        email: form.email,
        ...(form.newPassword && {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      };

      const updated = await apiRequest('/api/users/me', { method: 'PATCH', body: payload });
      onUpdated?.(updated);
      setSuccess(true);
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('Wrong current password')) setErrors({ currentPassword: 'Неверный текущий пароль' });
      else if (msg.includes('Email already taken')) setErrors({ email: 'Этот email уже занят' });
      else setErrors({ general: 'Ошибка при сохранении' });
    } finally {
      setLoading(false);
    }
  };

  const field = (id, label, type = 'text', placeholder = '') => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id} type={type} placeholder={placeholder}
        value={form[id]} onChange={set(id)}
        className={`border bg-input-background ${errors[id] ? 'border-red-500' : 'border-border'}`}
      />
      {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Настройки профиля</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground border-b border-border pb-2">Личные данные</p>
            {field('first_name', 'Имя', 'text', 'Иван')}
            {field('second_name', 'Фамилия', 'text', 'Иванов')}
            {field('name', 'Имя пользователя', 'text', 'ivan_ivanov')}
          </div>

          {/* Контакты */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground border-b border-border pb-2">Контакты</p>
            {field('email', 'Email', 'email', 'example@email.com')}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground border-b border-border pb-2">
              Смена пароля <span className="text-muted-foreground font-normal">(заполните, если хотите изменить)</span>
            </p>
            {field('currentPassword', 'Текущий пароль', 'password', '••••••••')}
            {field('newPassword', 'Новый пароль', 'password', '••••••••')}
            {field('confirmPassword', 'Повторите новый пароль', 'password', '••••••••')}
          </div>

          {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}
          {success && <p className="text-sm text-green-600">Данные успешно сохранены</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '..//dialog';
import { Input } from '../input';
import { Button } from '../button';
import { Label } from '../label';
import { Checkbox } from '../checkbox';
import { apiRequest } from '../../../api/client';

const FORMAT_OPTIONS = [
  { value: 'online', label: 'Онлайн' },
  { value: 'offline', label: 'Оффлайн' },
  { value: 'hybrid', label: 'Гибрид' },
];

const EMPTY_FORM = {
  name: '',
  desription: '',
  format: 'online',
  date: '',
  time: '',
  count_members: '',
  address: '',
  tag_id: '',
  age_id: '',
  organizer_id: '',
  is_reccuring: false,
  active: true,
};

export function EventFormDialog({ open, onOpenChange, event = null, authorName, onSaved }) {
  const isEdit = Boolean(event);

  const [form, setForm] = useState(EMPTY_FORM);
  const [tags, setTags] = useState([]);
  const [ages, setAges] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [organizerInput, setOrganizerInput] = useState('');
  const [showOrgSuggestions, setShowOrgSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    Promise.all([
      apiRequest('/api/events/tags'),
      apiRequest('/api/events/ages'),
      apiRequest('/api/events/organizers'),
    ]).then(([tagsData, agesData, orgsData]) => {
      setTags(tagsData);
      setAges(agesData);
      setOrganizers(Array.isArray(orgsData) ? orgsData : []);
    });
  }, [open]);

  useEffect(() => {
    if (event) {
      setForm({
        name: event.name || '',
        desription: event.desription || '',
        format: event.format || 'online',
        date: event.date ? new Date(event.date).toISOString().slice(0, 10) : '',
        time: event.time || '',
        count_members: event.count_members ?? '',
        address: event.address || '',
        tag_id: event.tag_id || '',
        age_id: event.age_id || '',
        organizer_id: event.organizer_id || '',
        is_reccuring: event.is_reccuring || false,
        active: event.active ?? true,
      });
        setOrganizerInput(event.organizer?.name || '');
    } else {
      setForm(EMPTY_FORM);
      setOrganizerInput('');
    }
    setErrors({});
  }, [event, open]);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((err) => ({ ...err, [field]: null }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = {};
  if (!form.name.trim()) newErrors.name = 'Обязательное поле';
  if (!form.format) newErrors.format = 'Обязательное поле';
  if (!form.date) newErrors.date = 'Обязательное поле';
  if (Object.keys(newErrors).length) return setErrors(newErrors);

  try {
    setLoading(true);

    let organizer_id = form.organizer_id;

    if (organizerInput.trim() && !organizer_id) {
      const newOrg = await apiRequest('/api/events/newOrganizer', {
        method: 'POST',
        body: { name: organizerInput.trim() },
      });
      organizer_id = newOrg.id;
      setOrganizers((prev) => [...prev, newOrg]);
    }
    if (organizer_id) {
      const selected = organizers.find((o) => o.id === organizer_id);
      if (selected && selected.name !== organizerInput.trim()) {
        const newOrg = await apiRequest('/api/events/organizers', {
          method: 'POST',
          body: { name: organizerInput.trim() },
        });
        organizer_id = newOrg.id;
        setOrganizers((prev) => [...prev, newOrg]);
      }
    }

    const payload = {
      ...form,
      organizer_id: organizer_id || null,
      count_members: form.count_members ? Number(form.count_members) : null,
      tag_id: form.tag_id || null,
      age_id: form.age_id || null,
    };

    if (isEdit) {
      await apiRequest(`/api/events/edit${event.id}`, { method: 'PATCH', body: payload });
    } else {
      await apiRequest('/api/events/newEvent', { method: 'POST', body: payload });
    }

    onSaved?.();
    onOpenChange(false);
  } catch (e) {
    setErrors({ general: 'Ошибка при сохранении' });
  } finally {
    setLoading(false);
  }
};

  const inputCls = (field) =>
    `border bg-input-background ${errors[field] ? 'border-red-500' : 'border-border'}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать мероприятие' : 'Создать мероприятие'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground border-b border-border pb-2">Основное</p>

            <div className="space-y-1.5">
              <Label htmlFor="name">Название *</Label>
              <Input id="name" value={form.name} onChange={set('name')} className={inputCls('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desription">Описание</Label>
              <textarea
                id="desription"
                value={form.desription}
                onChange={set('desription')}
                rows={3}
                className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="format">Формат *</Label>
              <select
                id="format"
                value={form.format}
                onChange={set('format')}
                className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm"
              >
                {FORMAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Дата и время */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground border-b border-border pb-2">Дата и время</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Дата *</Label>
                <Input id="date" type="date" value={form.date} onChange={set('date')} className={inputCls('date')} />
                {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Время</Label>
                <Input id="time" type="time" value={form.time} onChange={set('time')} className={inputCls('time')} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is_reccuring"
                checked={form.is_reccuring}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_reccuring: checked }))}
              />
              <Label htmlFor="is_reccuring" className="text-sm cursor-pointer">
                Повторяющееся (каждую неделю)
              </Label>
            </div>
          </div>

          {/* Место и участники */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground border-b border-border pb-2">Место и участники</p>
            <div className="space-y-1.5">
              <Label htmlFor="address">Адрес</Label>
              <Input id="address" value={form.address} onChange={set('address')} className={inputCls('address')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="count_members">Максимум участников</Label>
              <Input id="count_members" type="number" min="1" value={form.count_members} onChange={set('count_members')} className={inputCls('count_members')} />
            </div>
          </div>

          {/* Категории */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground border-b border-border pb-2">Категории</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tag_id">Тема</Label>
                <select
                  id="tag_id"
                  value={form.tag_id}
                  onChange={set('tag_id')}
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm"
                >
                  <option value="">— не выбрано —</option>
                  {tags.map((t) => <option key={t.id} value={t.id}>{t.tag}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age_id">Возрастная категория</Label>
                <select
                  id="age_id"
                  value={form.age_id}
                  onChange={set('age_id')}
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm"
                >
                  <option value="">— не выбрано —</option>
                  {ages.map((a) => <option key={a.id} value={a.id}>{a.age_category}</option>)}
                </select>
              </div>
            </div>
            </div>

            <div className="space-y-1.5 relative">
  <Label htmlFor="organizer_input">Организатор</Label>
  <Input
    id="organizer_input"
    value={organizerInput}
    onChange={(e) => {
      setOrganizerInput(e.target.value);
      setForm((f) => ({ ...f, organizer_id: '' })); // сбросить выбор
      setShowOrgSuggestions(true);
    }}
    onFocus={() => setShowOrgSuggestions(true)}
    onBlur={() => setTimeout(() => setShowOrgSuggestions(false), 150)}
    placeholder="Введите название организатора..."
    className="border border-border bg-input-background"
    autoComplete="off"
  />
  {showOrgSuggestions && organizerInput.trim() && (
    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-md max-h-48 overflow-y-auto">
      {organizers
        .filter((o) => o.name.toLowerCase().includes(organizerInput.toLowerCase()))
        .map((o) => (
          <button
            key={o.id}
            type="button"
            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
            onMouseDown={() => {
              setOrganizerInput(o.name);
              setForm((f) => ({ ...f, organizer_id: o.id }));
              setShowOrgSuggestions(false);
            }}
          >
            {o.name}
          </button>
        ))}
      {/* Показать подсказку о создании нового если нет точного совпадения */}
      {!organizers.some((o) => o.name.toLowerCase() === organizerInput.toLowerCase()) && (
        <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
          Будет создан новый организатор «{organizerInput.trim()}»
        </div>
      )}
    </div>
  )}
</div>

          {/* Автор и видимость */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground border-b border-border pb-2">Дополнительно</p>
            <div className="space-y-1.5">
              <Label>Автор</Label>
              <Input value={authorName || '—'} disabled className="border border-border bg-muted text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="active"
                checked={form.active}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, active: checked }))}
              />
              <Label htmlFor="active" className="text-sm cursor-pointer">
                Показывать мероприятие другим пользователям
              </Label>
            </div>
          </div>

          {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Сохранение...' : isEdit ? 'Сохранить изменения' : 'Создать мероприятие'}
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
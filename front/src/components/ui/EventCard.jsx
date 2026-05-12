import { Link } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';

const FORMAT_LABELS = {
  online: 'Онлайн',
  offline: 'Оффлайн',
  hybrid: 'Гибрид',
};

export function EventCard({ event, tagsMap, agesMap }) {
  const spotsLeft = (event.count_members ?? 0) - (event.members ?? 0);
  const isFull = spotsLeft <= 0;

  return (
    <Link
      to={`/events/${event.id}`}
      className="block border border-border rounded-lg overflow-hidden bg-card hover:border-primary/50 transition-colors"
    >
      <div className="p-6 space-y-4">
        {/* Заголовок + тег */}
        <div className="flex items-start justify-between gap-4 min-h-[56px]">
          <h3 className="font-medium text-foreground leading-snug line-clamp-2">
            {event.name}
          </h3>
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded whitespace-nowrap flex-shrink-0">
            {tagsMap[event.tag_id] || '—'}
          </span>
        </div>

        {/* Детали */}
        <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Дата
            </span>
            <span className="text-foreground font-medium">
              {event.date ? new Date(event.date).toLocaleDateString('ru-RU') : '—'}
              {event.time ? `, ${event.time}` : ''}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Формат</span>
            <span className="text-foreground font-medium">
              {FORMAT_LABELS[event.format] ?? event.format ?? '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Возраст</span>
            <span className="text-foreground font-medium">
              {agesMap[event.age_id] || '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> Мест
            </span>
            <span className={`font-medium ${isFull ? 'text-destructive' : 'text-foreground'}`}>
              {isFull ? 'Мест нет' : `${spotsLeft} из ${event.count_members ?? '?'}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
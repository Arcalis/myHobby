import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Calendar, Clock, MapPin, Users, Building2, Tag, ArrowLeft, Heart } from 'lucide-react';
import { LoginDialog } from '../auth/LoginDialog';
import { apiRequest } from '../../api/client';

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await apiRequest(`/api/events/${id}`);
        setEvent(data.event || data);
      } catch (error) {
        console.error(error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Мероприятие не найдено</h1>
          <Link to="/events">
            <Button variant="outline">Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleRegister = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    setIsRegistered(!isRegistered);
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <section className="bg-card border-b border-border py-6">
          <div className="max-w-5xl mx-auto px-6">
            <Button variant="ghost" onClick={() => navigate('/events')} className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Назад к мероприятиям
            </Button>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-[1fr,320px] gap-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
                    {event.category}
                  </span>
                  <span className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded text-sm">
                    {event.ageCategory}
                  </span>
                </div>

                <h1 className="text-3xl font-semibold text-foreground leading-tight">{event.title}</h1>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">{event.organizerName}</span>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-8">
                <h2 className="font-medium text-foreground">Описание</h2>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </div>

              <div className="space-y-4 border-t border-border pt-8">
                <h2 className="font-medium text-foreground">Детали мероприятия</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Дата</p>
                      <p className="font-medium text-foreground">
                        {new Date(event.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Время</p>
                      <p className="font-medium text-foreground">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Место проведения</p>
                      <p className="font-medium text-foreground">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tag className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Формат</p>
                      <p className="font-medium text-foreground capitalize">
                        {event.format === 'online' ? 'Онлайн' : event.format === 'offline' ? 'Оффлайн' : 'Гибрид'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Доступно мест</p>
                      <p className="font-medium text-foreground tabular-nums">
                        {event.availableSeats} из {event.totalSeats}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-8">
                <h2 className="font-medium text-foreground">Организатор</h2>
                <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                  <p className="font-medium text-foreground">{event.organizerName}</p>
                  <p className="text-sm text-muted-foreground">
                    Проверенный организатор образовательных мероприятий
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4 sticky top-24">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Доступно мест</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-foreground tabular-nums">
                      {event.availableSeats}
                    </span>
                    <span className="text-sm text-muted-foreground">из {event.totalSeats}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleRegister}
                  disabled={event.availableSeats === 0}
                  variant={isRegistered ? 'outline' : 'default'}
                >
                  {isRegistered ? 'Отменить запись' : event.availableSeats === 0 ? 'Мест нет' : 'Записаться'}
                </Button>

                <Button variant="outline" className="w-full gap-2" onClick={handleFavorite}>
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-primary' : ''}`} />
                  {isFavorite ? 'В избранном' : 'В избранное'}
                </Button>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Формат:</span>
                    <span className="font-medium text-foreground capitalize">
                      {event.format === 'online' ? 'Онлайн' : event.format === 'offline' ? 'Оффлайн' : 'Гибрид'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Возраст:</span>
                    <span className="font-medium text-foreground">{event.ageCategory}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Дата:</span>
                    <span className="font-medium text-foreground">
                      {new Date(event.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  );
}
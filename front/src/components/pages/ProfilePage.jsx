import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Heart, User, Settings, FileText } from 'lucide-react';
import { apiRequest } from '../../api/client';

export function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('registered');
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const data = await apiRequest('/api/profile');
        setRegisteredEvents(data.registeredEvents || []);
        setFavoriteEvents(data.favoriteEvents || []);
        setMyEvents(data.myEvents || []);
      } catch (error) {
        console.error(error);
        setRegisteredEvents([]);
        setFavoriteEvents([]);
        setMyEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-foreground mb-1">{user.name}</h1>
              <p className="text-muted-foreground mb-3">{user.email}</p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded text-sm font-medium capitalize">
                  {user.role === 'admin'
                    ? 'Администратор'
                    : user.role === 'organizer'
                      ? 'Организатор'
                      : 'Пользователь'}
                </span>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Настройки
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="registered" className="gap-2">
              <Calendar className="w-4 h-4" />
              Мои записи
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="w-4 h-4" />
              Избранное
            </TabsTrigger>
            {(user.role === 'organizer' || user.role === 'admin') && (
              <TabsTrigger value="my-events" className="gap-2">
                <FileText className="w-4 h-4" />
                Мои мероприятия
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="registered" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-foreground">
                Зарегистрированные мероприятия ({registeredEvents.length})
              </h2>
            </div>

            {loading ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : registeredEvents.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground mb-4">У вас пока нет зарегистрированных мероприятий</p>
                <Link to="/events">
                  <Button>Найти мероприятия</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {registeredEvents.map((event) => (
                  <div key={event.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                            {event.category}
                          </span>
                          <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                            Активна
                          </span>
                        </div>
                        <Link to={`/events/${event.id}`}>
                          <h3 className="font-medium text-foreground hover:text-primary transition-colors">
                            {event.title}
                          </h3>
                        </Link>
                        <div className="grid sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Дата</p>
                            <p className="text-foreground font-medium">
                              {new Date(event.date).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Время</p>
                            <p className="text-foreground font-medium">{event.time}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Формат</p>
                            <p className="text-foreground font-medium capitalize">
                              {event.format === 'online' ? 'Онлайн' : event.format === 'offline' ? 'Оффлайн' : 'Гибрид'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            Подробнее
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          Отменить
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-foreground">Избранные мероприятия ({favoriteEvents.length})</h2>
            </div>

            {loading ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : favoriteEvents.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground mb-4">У вас пока нет избранных мероприятий</p>
                <Link to="/events">
                  <Button>Найти мероприятия</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {favoriteEvents.map((event) => (
                  <div key={event.id} className="bg-card border border-border rounded-lg p-6 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        {event.category}
                      </span>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Heart className="w-4 h-4 fill-current text-primary" />
                      </Button>
                    </div>
                    <Link to={`/events/${event.id}`}>
                      <h3 className="font-medium text-foreground hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    <div className="pt-3 border-t border-border text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Дата:</span>
                        <span className="text-foreground font-medium">
                          {new Date(event.date).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {(user.role === 'organizer' || user.role === 'admin') && (
            <TabsContent value="my-events" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-foreground">Мои мероприятия ({myEvents.length})</h2>
                <Button>Создать мероприятие</Button>
              </div>

              {loading ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <p className="text-muted-foreground">Загрузка...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myEvents.map((event) => (
                    <div key={event.id} className="bg-card border border-border rounded-lg p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                              {event.category}
                            </span>
                            <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                              Опубликовано
                            </span>
                          </div>
                          <h3 className="font-medium text-foreground">{event.title}</h3>
                          <div className="grid sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">Дата</p>
                              <p className="text-foreground font-medium">
                                {new Date(event.date).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">Зарегистрировано</p>
                              <p className="text-foreground font-medium tabular-nums">
                                {event.totalSeats - event.availableSeats} чел.
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">Доступно мест</p>
                              <p className="text-foreground font-medium tabular-nums">{event.availableSeats}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">Формат</p>
                              <p className="text-foreground font-medium capitalize">
                                {event.format === 'online' ? 'Онлайн' : event.format === 'offline' ? 'Оффлайн' : 'Гибрид'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Редактировать
                          </Button>
                          <Button variant="outline" size="sm">
                            Участники
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
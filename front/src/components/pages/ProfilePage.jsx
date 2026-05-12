import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Heart, User, Settings, FileText, MapPin, Clock, Plus, Pencil } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { SettingsDialog } from '../ui/modal/settingDialog';
import { EventFormDialog } from '../ui/modal/eventFormDialog';


function EventCard({ event, actions, favorite = false }) {
  const title = event.name || event.title;
  const description = event.desription || event.description || '';
  const category = event.tag?.tag || event.category || 'Без категории';
  const date = event.date ? new Date(event.date).toLocaleDateString('ru-RU') : '—';
  const time = event.time || '—';
  const format = event.format === 'online' ? 'Онлайн' : event.format === 'offline' ? 'Оффлайн' : 'Гибрид';

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3 flex-wrap">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
              {category}
            </span>
            {favorite && (
              <span className="px-2 py-1 bg-pink-500/10 text-pink-600 rounded text-xs font-medium">
                В избранном
              </span>
            )}
          </div>

          <Link to={`/events/${event.id}`}>
            <h3 className="font-medium text-foreground hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>

          {description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          ) : null}

          <div className="grid sm:grid-cols-3 gap-4 text-sm pt-2">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Дата</p>
              <p className="text-foreground font-medium">{date}</p>
            </div>

            <div>
              <p className="text-muted-foreground text-xs mb-1">Время</p>
              <p className="text-foreground font-medium">{time}</p>
            </div>

            <div>
              <p className="text-muted-foreground text-xs mb-1">Формат</p>
              <p className="text-foreground font-medium">{format}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            {event.address && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.address}
              </span>
            )}
            {typeof event.members === 'number' && (
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {event.members} участников
              </span>
            )}
          </div>
        </div>

        {actions ? <div className="flex gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('registered');
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);




  const loadProfileData = async () => {
    try {
      const [registeredData, favoriteData, myEventsData] = await Promise.all([
        apiRequest('/api/users/me/registrations'),
        apiRequest('/api/users/me/favorites'),
        apiRequest('/api/events/my').catch(() => []),
      ]);

      const visibleRegistered = Array.isArray(registeredData)
        ? registeredData.filter(
          (event) => event.active === true && event.deleted === false
        )
        : [];

      const visibleFavorites = Array.isArray(favoriteData)
        ? favoriteData.filter(
          (event) => event.active === true && event.deleted === false
        )
        : [];

      setRegisteredEvents(visibleRegistered);
      setFavoriteEvents(visibleFavorites);

      // БЕЗ фильтрации
      setMyEvents(Array.isArray(myEventsData) ? myEventsData : []);

    } catch (error) {
      console.error(error);
      setRegisteredEvents([]);
      setFavoriteEvents([]);
      setMyEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);


  const handleUserUpdated = (updated) => {
    updateUser(updated);
  };

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
            <Button variant="outline" className="gap-2" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4" />
              Настройки
            </Button>

          </div>

        </div>

        <SettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
          user={user}
          onUpdated={handleUserUpdated}
        />

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
            <TabsTrigger value="my-events" className="gap-2">
              <FileText className="w-4 h-4" />
              Мои мероприятия
            </TabsTrigger>
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
              <div className="grid md:grid-cols-2 gap-4">
                {registeredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    actions={
                      <>
                        <Link to={`/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            Подробнее
                          </Button>
                        </Link>
                      </>
                    }
                  />
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
                  <EventCard
                    key={event.id}
                    event={event}
                    favorite
                    actions={
                      <Link to={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          Подробнее
                        </Button>
                      </Link>
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>


          <TabsContent value="my-events" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-foreground">Мои мероприятия ({myEvents.length})</h2>
              <Button className="gap-2" onClick={() => setShowCreateEvent(true)}>
                <Plus className="w-4 h-4" />
                Создать
              </Button>
            </div>

            {loading ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : myEvents.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">У вас пока нет мероприятий</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myEvents.map((event) => (
                  <div key={event.id} className="relative">
                    <EventCard
                      event={event}
                      favorite={false}
                      actions={null}
                    />
                    {/* Метка "Моё" и кнопка редактирования поверх карточки */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-xs font-medium">
                        {event.approved ? 'Одобрено' : 'На модерации'}
                      </span>
                      <button
                        onClick={(e) => { e.preventDefault(); setEditingEvent(event); }}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-card border border-border hover:bg-muted transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <EventFormDialog
            open={showCreateEvent}
            onOpenChange={setShowCreateEvent}
            authorName={user.name}
            onSaved={loadProfileData}
          />
          <EventFormDialog
            open={Boolean(editingEvent)}
            onOpenChange={(v) => { if (!v) setEditingEvent(null); }}
            event={editingEvent}
            authorName={user.name}
            onSaved={() => { setEditingEvent(null); loadProfileData(); }}
          />
        </Tabs>

      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Search, Calendar, Users, Shield, ArrowRight } from 'lucide-react';
import { apiRequest } from '../../api/client';

export function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagsMap, setTagsMap] = useState({});
  const [agesMap, setAgesMap] = useState({});


  useEffect(() => {
    const loadData = async () => {
      try {
        const [tagsData, agesData, eventsData] = await Promise.all([
          apiRequest('/api/events/tags'),
          apiRequest('/api/events/ages'),
          apiRequest('/api/events'),
        ]);

        const tagsObj = Object.fromEntries(tagsData.map(t => [t.id, t.tag]));
        const agesObj = Object.fromEntries(agesData.map(a => [a.id, a.age_category]));

        setTagsMap(tagsObj);
        setAgesMap(agesObj);

        const events = Array.isArray(eventsData)
          ? eventsData
          : eventsData.events || [];

        const shuffled = [...events];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setFeaturedEvents(shuffled.slice(0, 3));
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setFeaturedEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events-preview');
    eventsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col">
      <section className="relative bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold text-foreground leading-tight">
                Платформа образовательных мероприятий
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Открывайте новые возможности для развития. Находите актуальные образовательные программы,
                регистрируйтесь на мероприятия и расширяйте свои компетенции.
              </p>

              <div className="flex gap-4 pt-4">
                <Link to="/events">
                  <Button size="lg" className="gap-2">
                    Найти мероприятие
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" onClick={scrollToEvents}>
                  Узнать больше
                </Button>
              </div>
            </div>

            <div className="relative h-96 rounded-lg overflow-hidden border border-border">
              <img
                src="https://images.unsplash.com/photo-1758270704524-596810e891b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxlYXJuaW5nJTIwZWR1Y2F0aW9uJTIwY2xhc3Nyb29tfGVufDF8fHx8MTc3NjM0OTAwMnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Образовательные программы"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">Удобный поиск</h3>
              <p className="text-sm text-muted-foreground">
                Находите мероприятия по категориям, датам и форматам проведения
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">Простая регистрация</h3>
              <p className="text-sm text-muted-foreground">
                Записывайтесь на мероприятия в один клик и управляйте записями
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">Для организаторов</h3>
              <p className="text-sm text-muted-foreground">
                Публикуйте мероприятия и управляйте участниками
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">Надёжность</h3>
              <p className="text-sm text-muted-foreground">
                Модерация контента и проверка организаторов
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="events-preview" className="py-16 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Популярные мероприятия</h2>
              <p className="text-muted-foreground mt-1">Актуальные образовательные программы</p>
            </div>
            <Link to="/events">
              <Button variant="outline" className="gap-2">
                Все мероприятия
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-muted-foreground">Загрузка мероприятий...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block border border-border rounded-lg overflow-hidden bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4 min-h-[56px]">
                      <h3 className="font-medium text-foreground leading-snug line-clamp-2">
                        {event.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded whitespace-nowrap">
                        {tagsMap[event.tag_id] || event.tag_id}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-4">
                      <div className="flex items-center justify-between">
                        <span>Дата:</span>
                        <span className="text-foreground font-medium">
                          {new Date(event.date).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Формат:</span>
                        <span className="text-foreground font-medium capitalize">
                          {event.format}
                        </span>
                      </div>
                      {/* Строка возраста */}
                      <div className="flex items-center justify-between">
                        <span>Возраст:</span>
                        <span className="text-foreground font-medium">
                          {agesMap[event.age_id] || event.age_id}
                        </span>
                      </div>
                      {/* Исправленное отображение занятых/всего мест */}
                      <div className="flex items-center justify-between">
                        <span>Мест:</span>
                        <span className="text-foreground font-medium">
                          {event.members} из {event.count_members ?? '?'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-background border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Готовы начать обучение?
          </h2>
          <p className="text-muted-foreground">
            Присоединяйтесь к тысячам пользователей, которые уже развивают свои навыки через нашу платформу
          </p>
          <Link to="/events">
            <Button size="lg" className="gap-2">
              Посмотреть все мероприятия
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
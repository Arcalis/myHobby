import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Filter, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { apiRequest } from '../../api/client';
import { EventCard } from '../ui/EventCard';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAges, setSelectedAges] = useState([]);
  const [tagsMap, setTagsMap] = useState({});
  const [agesMap, setAgesMap] = useState({});

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const [eventsData, tagsData, agesData] = await Promise.all([
          apiRequest('/api/events'),
          apiRequest('/api/events/tags'),
          apiRequest('/api/events/ages'),
        ]);
        setTagsMap(Object.fromEntries(tagsData.map((t) => [t.id, t.tag])));
        setAgesMap(Object.fromEntries(agesData.map((a) => [a.id, a.age_category])));
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (error) {
        console.error(error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const formats = ['online', 'offline', 'hybrid'];
  const categories = useMemo(() => [...new Set(events.map((e) => e.tag_id).filter(Boolean))], [events]);
  const ages = useMemo(() => [...new Set(events.map((e) => e.age_id).filter(Boolean))], [events]);

  const filteredEvents = events.filter((event) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      (event.name || '').toLowerCase().includes(q) ||
      (event.description || '').toLowerCase().includes(q) ||
      (event.author || '').toLowerCase().includes(q) ||
      (tagsMap[event.tag_id] || '').toLowerCase().includes(q) ||
      (agesMap[event.age_id] || '').toLowerCase().includes(q);
    const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(event.format);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.tag_id);
    const matchesAge = selectedAges.length === 0 || selectedAges.includes(event.age_id);
    return matchesSearch && matchesFormat && matchesCategory && matchesAge;
  });

  const toggleFilter = (value, selected, setter) => {
    if (selected.includes(value)) setter(selected.filter((v) => v !== value));
    else setter([...selected, value]);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedFormats([]);
    setSelectedCategories([]);
    setSelectedAges([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Поисковая панель */}
      <section className="bg-card border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-2xl font-semibold text-foreground mb-6">Каталог мероприятий</h1>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию, описанию или организатору..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border border-border bg-card"
              />
            </div>
            {(searchQuery || selectedFormats.length > 0 || selectedCategories.length > 0 || selectedAges.length > 0) && (
              <Button variant="outline" onClick={clearFilters}>
                Сбросить фильтры
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">

          {/* Фильтры */}
          <aside className="w-[280px] flex-shrink-0 hidden lg:block">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-medium text-foreground">Фильтры</h2>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Формат проведения</h3>
                <div className="space-y-2">
                  {formats.map((format) => (
                    <div key={format} className="flex items-center gap-2">
                      <Checkbox
                        id={`format-${format}`}
                        checked={selectedFormats.includes(format)}
                        onCheckedChange={() => toggleFilter(format, selectedFormats, setSelectedFormats)}
                      />
                      <Label htmlFor={`format-${format}`} className="text-sm text-muted-foreground capitalize cursor-pointer">
                        {format === 'online' ? 'Онлайн' : format === 'offline' ? 'Оффлайн' : 'Гибрид'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-6">
                <h3 className="text-sm font-medium text-foreground">Категория</h3>
                <div className="space-y-2">
                  {categories.map((tagId) => (
                    <div key={tagId} className="flex items-center gap-2">
                      <Checkbox
                        id={`category-${tagId}`}
                        checked={selectedCategories.includes(tagId)}
                        onCheckedChange={() => toggleFilter(tagId, selectedCategories, setSelectedCategories)}
                      />
                      <Label htmlFor={`category-${tagId}`} className="text-sm text-muted-foreground cursor-pointer">
                        {tagsMap[tagId] || tagId}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-6">
                <h3 className="text-sm font-medium text-foreground">Возрастная категория</h3>
                <div className="space-y-2">
                  {ages.map((ageId) => (
                    <div key={ageId} className="flex items-center gap-2">
                      <Checkbox
                        id={`age-${ageId}`}
                        checked={selectedAges.includes(ageId)}
                        onCheckedChange={() => toggleFilter(ageId, selectedAges, setSelectedAges)}
                      />
                      <Label htmlFor={`age-${ageId}`} className="text-sm text-muted-foreground cursor-pointer">
                        {agesMap[ageId] || ageId}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Карточки */}
          <div className="flex-1 space-y-4">
            <p className="text-sm text-muted-foreground">
              Найдено мероприятий: <span className="font-medium text-foreground">{filteredEvents.length}</span>
            </p>

            {loading ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Загрузка мероприятий...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Мероприятия не найдены</p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} tagsMap={tagsMap} agesMap={agesMap} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
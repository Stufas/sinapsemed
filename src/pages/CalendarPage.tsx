import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 13)); // Oct 13, 2025
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(2025, 9, 13), { weekStartsOn: 0 }));
  const [selectedDay, setSelectedDay] = useState(new Date(2025, 9, 13));

  const monthName = currentDate.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  // Mock events for demonstration
  const events = [
    { date: new Date(2025, 9, 25), type: "exam", title: "Prova de Anatomia I", time: "14:00" },
    { date: new Date(2025, 9, 20), type: "assignment", title: "Trabalho de Fisiologia", time: "23:59" },
    { date: new Date(2025, 9, 15), type: "class", title: "Aula de Bioquímica", time: "10:00" },
    { date: new Date(2025, 9, 13), type: "study", title: "Revisão - Sistema Cardiovascular", time: "18:00" },
    { date: new Date(2025, 9, 13), type: "class", title: "Aula de Histologia", time: "08:00" },
    { date: new Date(2025, 9, 14), type: "study", title: "Estudo de Farmacologia", time: "16:00" },
    { date: new Date(2025, 9, 16), type: "class", title: "Seminário de Patologia", time: "10:30" },
  ];

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  };

  const getHourlySlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getEventForDateTime = (date: Date, time: string) => {
    return events.find(event => 
      isSameDay(event.date, date) && event.time.startsWith(time.split(':')[0])
    );
  };

  const getEventColor = (type: string) => {
    const colors = {
      exam: "bg-calendar-exam",
      assignment: "bg-calendar-assignment",
      class: "bg-calendar-class",
      study: "bg-calendar-study",
      personal: "bg-calendar-personal",
    };
    return colors[type as keyof typeof colors] || "bg-muted";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Calendário</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as suas atividades acadêmicas
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      <Tabs defaultValue="month" className="space-y-4">
        <TabsList>
          <TabsTrigger value="month">Mês</TabsTrigger>
          <TabsTrigger value="week">Semana</TabsTrigger>
          <TabsTrigger value="day">Dia</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          <Card className="p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold capitalize">{monthName}</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {getDaysInMonth().map((day, index) => {
                const currentDayDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
                const dayEvents = currentDayDate ? getEventsForDate(currentDayDate) : [];
                const isToday = day === 13 && currentDate.getMonth() === 9;
                
                return (
                  <div
                    key={index}
                    className={`min-h-24 rounded-lg border p-2 ${
                      day ? "cursor-pointer hover:bg-muted/50" : ""
                    } ${isToday ? "border-primary bg-primary/5" : ""}`}
                  >
                    {day && (
                      <>
                        <div className={`mb-2 text-sm font-medium ${isToday ? "text-primary" : ""}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.map((event, i) => (
                            <div
                              key={i}
                              className={`rounded px-2 py-1 text-xs text-white ${getEventColor(event.type)}`}
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Legend */}
          <Card className="p-4 shadow-card">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-calendar-exam" />
                <span className="text-sm">Prova</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-calendar-assignment" />
                <span className="text-sm">Trabalho</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-calendar-class" />
                <span className="text-sm">Aula</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-calendar-study" />
                <span className="text-sm">Estudo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-calendar-personal" />
                <span className="text-sm">Pessoal</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card className="p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeekStart(subWeeks(weekStart, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setWeekStart(startOfWeek(new Date(2025, 9, 13), { weekStartsOn: 0 }))}
                >
                  Esta Semana
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeekStart(addWeeks(weekStart, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-2">
              {getWeekDays().map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isToday = isSameDay(day, new Date(2025, 9, 13));
                
                return (
                  <div key={index} className="space-y-2">
                    <div className={`rounded-lg border p-3 text-center ${isToday ? "border-primary bg-primary/5" : ""}`}>
                      <div className="text-xs font-medium text-muted-foreground uppercase">
                        {format(day, "EEE", { locale: ptBR })}
                      </div>
                      <div className={`text-2xl font-bold ${isToday ? "text-primary" : ""}`}>
                        {format(day, "d")}
                      </div>
                    </div>
                    <div className="space-y-2 min-h-[300px]">
                      {dayEvents.length > 0 ? (
                        dayEvents.map((event, i) => (
                          <div
                            key={i}
                            className={`rounded-lg p-3 text-white ${getEventColor(event.type)} cursor-pointer hover:opacity-90 transition-opacity`}
                          >
                            <div className="flex items-start gap-2">
                              <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium mb-1">{event.time}</div>
                                <div className="text-sm font-semibold line-clamp-2">{event.title}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          Sem eventos
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <Card className="p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold capitalize">
                {format(selectedDay, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDay(addDays(selectedDay, -1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDay(new Date(2025, 9, 13))}
                >
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDay(addDays(selectedDay, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Day Schedule */}
            <div className="space-y-0 border rounded-lg overflow-hidden">
              {getHourlySlots().map((time, index) => {
                const event = getEventForDateTime(selectedDay, time);
                
                return (
                  <div 
                    key={index} 
                    className="flex border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-20 flex-shrink-0 border-r p-3 text-sm font-medium text-muted-foreground bg-muted/20">
                      {time}
                    </div>
                    <div className="flex-1 p-3 min-h-[60px]">
                      {event ? (
                        <div className={`rounded-lg p-3 h-full ${getEventColor(event.type)} text-white cursor-pointer hover:opacity-90 transition-opacity`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold mb-1">{event.title}</div>
                              <div className="text-xs opacity-90 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.time}
                              </div>
                            </div>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-sm text-muted-foreground/50">
                          -
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="agenda">
          <Card className="p-6 shadow-card">
            <h3 className="mb-4 text-lg font-semibold">Próximas Atividades</h3>
            <div className="space-y-4">
              {events
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((event, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{format(event.date, "d")}</div>
                      <div className="text-xs text-muted-foreground uppercase">{format(event.date, "MMM", { locale: ptBR })}</div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${getEventColor(event.type)}`} />
                        <p className="font-semibold">{event.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarPage;

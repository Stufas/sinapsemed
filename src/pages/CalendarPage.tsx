import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 13)); // Oct 13, 2025

  const monthName = currentDate.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  // Mock events for demonstration
  const events = [
    { date: 25, type: "exam", title: "Prova de Anatomia I", time: "14:00" },
    { date: 20, type: "assignment", title: "Trabalho de Fisiologia", time: "23:59" },
    { date: 15, type: "class", title: "Aula de Bioquímica", time: "10:00" },
    { date: 13, type: "study", title: "Revisão - Sistema Cardiovascular", time: "18:00" },
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
                const dayEvents = events.filter((e) => e.date === day);
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

        <TabsContent value="agenda">
          <Card className="p-6 shadow-card">
            <h3 className="mb-4 text-lg font-semibold">Próximas Atividades</h3>
            <div className="space-y-4">
              {events
                .sort((a, b) => a.date - b.date)
                .map((event, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{event.date}</div>
                      <div className="text-xs text-muted-foreground">OUT</div>
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

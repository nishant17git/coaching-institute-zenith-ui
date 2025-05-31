
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { format, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";

export function UpcomingEvents() {
  const navigate = useNavigate();

  // Mock upcoming events - in a real app, this would come from a calendar/events API
  const upcomingEvents = [
    {
      id: 1,
      title: "Parent-Teacher Meeting",
      date: addDays(new Date(), 2),
      time: "10:00 AM - 4:00 PM",
      location: "School Auditorium",
      type: "meeting",
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Class 10 Mathematics Test",
      date: addDays(new Date(), 5),
      time: "9:00 AM - 11:00 AM",
      location: "Room 201",
      type: "exam",
      color: "bg-red-500"
    },
    {
      id: 3,
      title: "Science Fair Preparation",
      date: addDays(new Date(), 7),
      time: "2:00 PM - 5:00 PM",
      location: "Science Lab",
      type: "activity",
      color: "bg-green-500"
    },
    {
      id: 4,
      title: "Fee Collection Reminder",
      date: addDays(new Date(), 10),
      time: "All Day",
      location: "Office",
      type: "reminder",
      color: "bg-orange-500"
    }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="font-geist">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
              <div className={`w-3 h-3 rounded-full ${event.color} mt-2 flex-shrink-0`}></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium font-geist text-sm">{event.title}</h4>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-geist">
                    <Calendar className="h-3 w-3" />
                    {format(event.date, "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-geist">
                    <Clock className="h-3 w-3" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-geist">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-geist capitalize">
                {event.type}
              </Badge>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-4 font-geist" onClick={() => navigate('/attendance')}>
          View Calendar <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

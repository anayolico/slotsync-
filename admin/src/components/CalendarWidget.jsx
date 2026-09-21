import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarWidget({ appointments = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Extract event days matching currentDate month and year
  const appointmentDays = appointments.map(a => {
    if (!a.start_time_utc) return null;
    const d = new Date(a.start_time_utc);
    if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
      return d.getDate();
    }
    return null;
  }).filter(Boolean);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      hasEvent: appointmentDays.includes(i)
    });
  }

  // Next month leading days
  const remaining = 35 - calendarDays.length;
  for (let i = 1; i <= Math.max(0, remaining); i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <h2 className="calendar-title">
          {monthNames[month]}, {year}
        </h2>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="calendar-nav-btn" onClick={handlePrevMonth}>
            <ChevronLeft size={18} />
          </button>
          <button className="calendar-nav-btn" onClick={handleNextMonth}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {daysOfWeek.map((d, index) => (
          <span key={index}>{d}</span>
        ))}
      </div>

      <div className="calendar-days-grid">
        {calendarDays.map((item, index) => {
          const isSelected = item.isCurrentMonth && item.day === selectedDay;
          return (
            <div
              key={index}
              className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${!item.isCurrentMonth ? 'dimmed' : ''}`}
              onClick={() => item.isCurrentMonth && setSelectedDay(item.day)}
            >
              <span>{item.day}</span>
              {item.hasEvent && <span className="event-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
    <div className="calendar-card-widget">
      <div className="calendar-header">
        <h2 className="calendar-title">
          {monthNames[month]}, {year}
        </h2>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="calendar-nav-btn" onClick={handlePrevMonth} aria-label="Previous Month">
            <ChevronLeft size={16} />
          </button>
          <button className="calendar-nav-btn" onClick={handleNextMonth} aria-label="Next Month">
            <ChevronRight size={16} />
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

      <style>{`
        .calendar-card-widget {
          background: #ffffff;
          border-radius: var(--radius-lg, 16px);
          border: 1px solid var(--border-light, #e2e8f0);
          padding: 1.25rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          width: 100%;
          box-sizing: border-box;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .calendar-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-main, #1e293b);
          font-family: inherit;
        }

        .calendar-nav-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.3rem 0.4rem;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .calendar-nav-btn:hover {
          background: #eef2ff;
          color: #4f46e5;
          border-color: #c7d2fe;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }

        .calendar-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.3rem;
        }

        .calendar-day-cell {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          border-radius: 10px;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
        }

        .calendar-day-cell:hover:not(.dimmed) {
          background: #f1f5f9;
        }

        .calendar-day-cell.dimmed {
          color: #cbd5e1;
          cursor: default;
        }

        .calendar-day-cell.selected {
          background: #4f46e5;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(79,70,229,0.35);
        }

        .event-dot {
          position: absolute;
          bottom: 3px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #6366f1;
        }

        .calendar-day-cell.selected .event-dot {
          background: #ffffff;
        }
      `}</style>
    </div>
  );
}

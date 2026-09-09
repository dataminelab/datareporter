import React, { useState } from "react";

type Schedule = {
  date: string;
  time: string;
};

type ReportSchedulerProps = {
  onSchedule: (schedule: Schedule) => void;
};

const ReportScheduler: React.FC<ReportSchedulerProps> = ({ onSchedule }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSchedule = () => {
    if (date && time) {
      onSchedule({ date, time });
    }
  };

  return (
    <div>
      <h3>Schedule Report</h3>
      <div>
        <label>
          Date:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Time:
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>
      <button onClick={handleSchedule} disabled={!date || !time}>
        Schedule
      </button>
    </div>
  );
};

export default ReportScheduler;

// app/components/BigCalendarClientWrapper.tsx
"use client";

import BigCalendar from "../components/BigCalender";

const BigCalendarClientWrapper = ({
  data,
}: {
  data: { title: string; start: Date; end: Date }[];
}) => {
  return <BigCalendar data={data} />;
};

export default BigCalendarClientWrapper;

"use client";

import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import axios from "axios";

const Chart = dynamic(() => import("../components/Chart"), { ssr: false });

async function fetchData(startTime: Dayjs, endTime: Dayjs) {
  const startDate = startTime?.toISOString();
  const endDate = endTime?.toISOString();
  const payload = (await axios.get(
    `/api/?startDate=${startDate}&endDate=${endDate}`
  )) as { data: { data: { _id: string; count: number }[] } };
  return payload.data.data;
}

export function Index() {
  const [startTime, setStartTime] = useState<Dayjs>(dayjs().startOf("day"));
  const [endTime, setEndTime] = useState<Dayjs>(dayjs().endOf("day"));
  const [data, setData] = useState<{ _id: string; count: number }[]>([]);

  const handleFilter = async () => {
    console.log("handleFilter");
    const data = await fetchData(startTime, endTime);
    setData(data);
  };
  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Navbar></Navbar>
        <div>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 items-center justify-center">
            <div className="">
              <p>Start Time</p>
              <DateTimePicker
                value={startTime}
                onChange={(value) => {
                  if (value) setStartTime(value);
                }}
              />
            </div>
            <div className="">
              <p>End Time</p>
              <DateTimePicker
                value={endTime}
                onChange={(value) => {
                  if (value) setEndTime(value);
                }}
              />
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  handleFilter();
                }}
                className="btn btn-neutral"
              >
                Filter
              </button>
            </div>
          </div>
        </div>

        <Chart data={data} />
      </LocalizationProvider>
    </div>
  );
}

export default Index;

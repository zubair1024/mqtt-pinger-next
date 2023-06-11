// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { connectDB } from "@/db/db";
import { Ping } from "@/db/models/Ping";
import dayjs from "dayjs";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  data: { _id: string; count: number }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { startDate: startDateString, endDate: endDateString } = req.query;
  if (req.method === "GET") {
    console.log(startDateString);
    console.log(endDateString);

    const startTime = dayjs(startDateString as string).toDate();
    const endTime = dayjs(endDateString as string).toDate();

    await connectDB();
    const data = await Ping.aggregate([
      {
        $match: {
          eventTime: {
            $gte: startTime,
            $lte: endTime,
          },
        },
      },
      {
        $project: {
          timestamp: "$eventTime",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M:%S",
              date: {
                $dateFromParts: {
                  year: { $year: "$timestamp" },
                  month: { $month: "$timestamp" },
                  day: { $dayOfMonth: "$timestamp" },
                  hour: { $hour: "$timestamp" },
                  minute: { $minute: "$timestamp" },
                  second: { $second: "$timestamp" },
                },
              },
              timezone: "Europe/Berlin", // Replace with your desired timezone
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    return res.status(200).json({ data });
  }
  //@ts-expect-error ignore
  return res.status(404).send({});
}

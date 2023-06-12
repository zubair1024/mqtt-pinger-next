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
    const startTime = dayjs(startDateString as string).toDate();
    const endTime = dayjs(endDateString as string).toDate();

    await connectDB();
    const data = (await Ping.aggregate([
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
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])) as { _id: string; count: number }[];

    console.log(data.length);

    const result = [];
    let pointer = dayjs(startTime);
    const end = dayjs(endTime);
    while (pointer < end) {
      const timestamp = pointer.format("YYYY-MM-DD HH:mm:ss");

      const index = data.findIndex((i) => i._id === timestamp);

      let count = 0;

      if (index !== -1) {
        // Remove the element from the array
        const removedElement = data.splice(index, 1)[0];
        count = removedElement.count;
      }

      result.push({
        _id: timestamp,
        count: count ?? 0,
      });
      pointer = pointer.add(1, "second");
    }

    return res.status(200).json({ data: result });
  }
  //@ts-expect-error ignore
  return res.status(404).send({});
}

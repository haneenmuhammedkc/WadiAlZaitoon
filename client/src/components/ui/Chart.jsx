import React from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  YAxis,
  XAxis,
} from "recharts";
import { format } from "timeago.js";

export default function Chart({ data }) {
  const realData = data?.map((item) => ({
    price: item.totalPrice,
    date: format(item.createdAt),
  }));

  return (
    <div className="w-full h-64 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
      <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800">
        Revenue & Booking Trends
      </h3>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={realData}>
            <Tooltip
              content={(props) => (
                <div>
                  {props.payload?.map((item) => (
                    <div
                      className="bg-slate-900 text-white py-2 px-3 rounded-xl shadow-lg text-xs font-sans"
                      key={item.payload.date}
                    >
                      <p className="font-bold text-emerald-400">Revenue: ₹{item.value}</p>
                      <p className="text-[10px] text-slate-300">Time: {item.payload.date}</p>
                    </div>
                  ))}
                </div>
              )}
            />
            <YAxis dataKey="price" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
            <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
            <Bar dataKey="price" fill="#0F172A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

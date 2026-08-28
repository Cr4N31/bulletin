import { View, Text } from "react-native";
import { HabitLog } from "@/db/habit";

function getLast30Dates(): string[] {
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export default function StreakGraph({ logs }: { logs: HabitLog[] }) {
  const dates = getLast30Dates();
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date),
  );

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {dates.map((date) => {
        const completed = completedDates.has(date);
        return (
          <View
            key={date}
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              backgroundColor: completed ? "#000" : "#00000010",
            }}
          />
        );
      })}
    </View>
  );
}

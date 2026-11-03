// "2026-11-22" -> "Nov 22, 2026"
export const formatDepartureDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

export const todayString = () => new Date().toISOString().split("T")[0];

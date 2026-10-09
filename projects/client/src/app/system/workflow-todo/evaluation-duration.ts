export function formatElapsedDuration(startedAt: string | null, completedAt: string | null): string {
    if (startedAt === null || completedAt === null) {
        return 'Unknown';
    }

    const start = Date.parse(startedAt);
    const completion = Date.parse(completedAt);
    if (!Number.isFinite(start) || !Number.isFinite(completion)) {
        return 'Unavailable (invalid timestamp)';
    }

    const elapsedSeconds = Math.floor((completion - start) / 1000);
    if (elapsedSeconds < 0) {
        return 'Unavailable (completion precedes start)';
    }

    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    return hours > 0
        ? `${hours}h ${minutes}m ${seconds}s`
        : `${Math.floor(elapsedSeconds / 60)}m ${seconds}s`;
}

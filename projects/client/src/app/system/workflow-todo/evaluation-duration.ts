import type { WorkEvaluation } from '@shared';

function elapsedMilliseconds(startedAt: string | null, completedAt: string | null): number | string {
    if (startedAt === null || completedAt === null) {
        return 'Unknown';
    }

    const start = Date.parse(startedAt);
    const completion = Date.parse(completedAt);
    if (!Number.isFinite(start) || !Number.isFinite(completion)) {
        return 'Unavailable (invalid timestamp)';
    }

    const milliseconds = completion - start;
    if (milliseconds < 0) {
        return 'Unavailable (completion precedes start)';
    }

    return milliseconds;
}

function formatMilliseconds(milliseconds: number): string {
    const elapsedSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    const minuteAndSecondText = `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    return hours > 0
        ? `${String(hours).padStart(2, '0')}h ${minuteAndSecondText}`
        : minuteAndSecondText;
}

export function formatElapsedDuration(startedAt: string | null, completedAt: string | null): string {
    const elapsed = elapsedMilliseconds(startedAt, completedAt);
    return typeof elapsed === 'number' ? formatMilliseconds(elapsed) : elapsed;
}

export function formatSummedElapsedDuration(
    evaluations: readonly Pick<WorkEvaluation, 'startedAt' | 'completedAt'>[],
): string {
    let milliseconds = 0;
    let known = 0;
    let unknown = 0;
    let unavailable = 0;
    for (const evaluation of evaluations) {
        if (evaluation.completedAt === null) {
            continue;
        }
        const elapsed = elapsedMilliseconds(evaluation.startedAt, evaluation.completedAt);
        if (typeof elapsed === 'number') {
            milliseconds += elapsed;
            known++;
        } else if (elapsed === 'Unknown') {
            unknown++;
        } else {
            unavailable++;
        }
    }
    if (known + unknown + unavailable === 0) {
        return '—';
    }
    const summary = [known ? formatMilliseconds(milliseconds) : unknown ? 'Unknown' : 'Unavailable'];
    if (unknown) {
        summary.push(`${unknown} unknown`);
    }
    if (unavailable) {
        summary.push(`${unavailable} unavailable`);
    }
    return summary.join('; ');
}

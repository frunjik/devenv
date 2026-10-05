import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LoggerService {
    error(message: string, error: Error): void {
        console.error(message, error);
    }
}

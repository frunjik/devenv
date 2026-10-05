import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { BusyIndicatorService } from './busy-indicator.service';

export const busyIndicatorInterceptor: HttpInterceptorFn = (request, next) => {
    const busyIndicator = inject(BusyIndicatorService);
    busyIndicator.requestStarted();
    return next(request).pipe(finalize(() => busyIndicator.requestFinished()));
};

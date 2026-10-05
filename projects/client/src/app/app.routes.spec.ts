import { ProblemInquiryPageComponent } from './problem-inquiry/problem-inquiry-page.component';
import { routes } from './app.routes';

describe('routes', () => {
    it('exposes the problem inquiry vertical slice at its own route', () => {
        expect(routes.find(route => route.path === 'problem-inquiry')?.component)
            .toBe(ProblemInquiryPageComponent);
    });
});

import type { Request, RequestHandler } from 'express';

export interface AuthenticatedPrincipal {
    id: string;
    [claim: string]: unknown;
}

export interface AuthenticationService {
    authenticate(request: Request): Promise<AuthenticatedPrincipal | null>;
}

const developmentAuthenticationService: AuthenticationService = {
    async authenticate() {
        return { id: 'anonymous' };
    },
};

export function createAuthenticationMiddleware(service: AuthenticationService): RequestHandler {
    return (request, response, next) => {
        void Promise.resolve()
            .then(() => service.authenticate(request))
            .then(principal => {
                if (principal === null) {
                    response.status(401).json({ error: { message: 'Authentication required' } });
                    return;
                }

                // Route handlers can consume the authenticated identity from response locals.
                response.locals['principal'] = principal;
                next();
            })
            .catch(next);
    };
}

export function getDevelopmentAuthenticationService(): AuthenticationService {
    return developmentAuthenticationService;
}

export interface RegisterServiceWorkerOptions {
    /** When true (default), post SKIP_WAITING on update and reload on controllerchange. */
    autoUpdate?: boolean;
}
/**
 * Register a service worker URL with Piligrim-style silent update reload.
 * Errors are swallowed (offline / unsupported).
 */
export declare function registerServiceWorker(url: string, options?: RegisterServiceWorkerOptions): void;
//# sourceMappingURL=registerServiceWorker.d.ts.map
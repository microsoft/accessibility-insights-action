declare module 'wmi-client' {
    export = wmic;
    class wmic {
        constructor(options?: WMICOptions);
        private _getArgs;
        private _getArgsForLinux;
        private _getArgsForWindows;
        /**
         * Prepeare WQL query
         * @param wql
         * @param namespace
         * @param callback
         * @returns {wmic}
         */
        query(query: string, callback: (err: string, features: Feature[]) => void): wmic;
        wql: string;
        namespace: string;
        private _exec;
        private _wql2wmic;
    }

    interface WMICOptions {
        host: string | null;
        username: string;
        password: string;
        namespace: string;
        timeout: number;
        wmic: string;
        ntlm2: boolean;
        cwd: string;
    }
}

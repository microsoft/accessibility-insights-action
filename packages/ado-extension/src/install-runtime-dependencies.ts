import { execSync } from 'child_process';

export function installRuntimeDependencies() {
    console.log('installing runtime dependencies...');
    execSync('yarn install --prod --ignore-engines --frozen-lockfile', {
        stdio: 'inherit',
        cwd: __dirname,
    });
}

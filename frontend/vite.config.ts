import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// FIT-74: version shown in the profile. The number comes from package.json (also the Android versionName);
// the commit — BUILD_COMMIT from deploy/release.sh (Docker has no .git), otherwise the local git checkout.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

function buildCommit(): string {
  if (process.env.BUILD_COMMIT) return process.env.BUILD_COMMIT
  try {
    return execSync('git log -1 --format=%h -- .', { cwd: new URL('.', import.meta.url) }).toString().trim() || 'dev'
  } catch {
    return 'dev'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_COMMIT__: JSON.stringify(buildCommit()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})

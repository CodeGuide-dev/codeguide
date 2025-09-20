import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export interface AuthConfig {
  apiKey?: string
  apiUrl?: string
}

const CONFIG_DIR = path.join(os.homedir(), '.codeguide')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

class AuthStorage {
  private ensureConfigDir(): void {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 })
    }
  }

  private readConfig(): AuthConfig {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const configData = fs.readFileSync(CONFIG_FILE, 'utf8')
        return JSON.parse(configData)
      }
    } catch (error) {
      // If file exists but is corrupted, we'll start fresh
      console.warn('Warning: Config file is corrupted, starting fresh')
    }
    return {}
  }

  private writeConfig(config: AuthConfig): void {
    this.ensureConfigDir()
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 })
  }

  saveAuthConfig(config: Partial<AuthConfig>): void {
    const currentConfig = this.readConfig()
    const newConfig = { ...currentConfig, ...config }
    this.writeConfig(newConfig)
  }

  getAuthConfig(): AuthConfig {
    return this.readConfig()
  }

  getApiKey(): string | undefined {
    const config = this.readConfig()
    return config.apiKey
  }

  getApiUrl(): string | undefined {
    const config = this.readConfig()
    return config.apiUrl
  }

  clearAuthConfig(): void {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE)
    }
  }

  hasAuthConfig(): boolean {
    const config = this.readConfig()
    return !!config.apiKey
  }

  getAuthMethod(): string {
    const config = this.readConfig()
    if (config.apiKey) {
      return 'API Key'
    }
    return 'None'
  }

  getAuthInfo(): string {
    const config = this.readConfig()
    const method = this.getAuthMethod()

    if (method === 'None') {
      return 'No authentication configured'
    }

    let info = `Authentication method: ${method}\n`
    info += `API URL: ${config.apiUrl || 'https://api.codeguide.app'}\n`

    if (config.apiKey) {
      info += `API Key: ${config.apiKey.substring(0, 10)}...\n`
    }

    return info
  }
}

export const authStorage = new AuthStorage()

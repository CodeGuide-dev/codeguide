import { BaseService } from '../services/base/base-service'
import { APIServiceConfig } from '../types'

export class TestService extends BaseService {
  constructor(config: APIServiceConfig) {
    super(config)
  }

  // Public methods to test protected methods
  public async testGet(url: string, config?: any): Promise<any> {
    return this.get(url, config)
  }

  public async testPost(url: string, data?: any, config?: any): Promise<any> {
    return this.post(url, data, config)
  }

  public async testPut(url: string, data?: any, config?: any): Promise<any> {
    return this.put(url, data, config)
  }

  public async testDelete(url: string, config?: any): Promise<any> {
    return this.delete(url, config)
  }

  public testBuildUrl(endpoint: string): string {
    return this.buildUrl(endpoint)
  }

  public testGetAuthenticationMethod() {
    return this.getAuthenticationMethod()
  }

  public testValidateAuthentication() {
    return this.validateAuthentication()
  }
}

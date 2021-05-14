/* eslint-disable no-unused-vars */
import * as sdk from 'commerce-sdk-isomorphic'
import { isError, isTokenValid } from './utils'

class CommerceSDK {
  constructor(config = {}) {
    const { proxyPath, ...restConfig } = config
    const proxy = `${proxyPath}`
    const apis = {
      shopperCustomers: sdk.ShopperCustomers,
      shopperProducts: sdk.ShopperProducts,
      shopperSearch: sdk.ShopperSearch,
    }

    this.config = { proxy, ...restConfig }
    this.authToken = null

    const self = this
    Object.keys(apis).forEach((key) => {
      const SdkClass = apis[key]
      self._sdkInstances = {
        ...self._sdkInstances,
        [key]: new Proxy(new SdkClass(this.config), {
          get: function (obj, prop) {
            if (typeof obj[prop] === 'function') {
              return (...args) => {
                if (args[0].ignoreHooks) {
                  return obj[prop](...args)
                }
                return self.willSendRequest(prop, ...args).then((newArgs) => {
                  return obj[prop](...newArgs).then((res) => self.didReceiveResponse(res, newArgs))
                })
              }
            }
            return obj[prop]
          },
        }),
      }
      Object.defineProperty(self, key, {
        get() {
          return self._sdkInstances[key]
        },
      })
    })
    this.getConfig = this.getConfig.bind(this)
  }

  /**
   * Returns the api client configuration
   * @returns {ClientConfig}
   */
  getConfig() {
    return this.config
  }

  async login() {
    if (isTokenValid(this.authToken)) {
      return
    }

    if (this._pendingLogin) {
      return this._pendingLogin
    }
    let retries = 0
    const startLoginFlow = () => {
      return this.authenticate().catch((error) => {
        if (retries === 0 && error.message === 'EXPIRED_TOKEN') {
          retries = 1
          this.authToken = undefined
          return startLoginFlow()
        }
        throw error
      })
    }
    this.pendingLogin = startLoginFlow().finally(() => {
      this.pendingLogin = undefined
    })
    return this.pendingLogin
  }

  async authenticate() {
    const res = await this.shopperCustomers.authorizeCustomer({ body: { type: 'guest' } }, true)
    const resJson = await res.json()
    const authToken = res.headers.get('authorization')
    if (res.status >= 400) {
      if (resJson.title === 'Expired Token') {
        throw new Error('EXPIRED_TOKEN')
      }
      throw new Error(resJson.detail)
    }
    this.authToken = authToken
    return authToken
  }

  async willSendRequest(methodName, ...params) {
    if (methodName === 'authorizeCustomer') {
      return params
    }
    if (this.pendingLogin) {
      await this.pendingLogin
    }
    if (!isTokenValid(this.authToken)) {
      await this.login()
    }
    const [fetchOptions, ...restParams] = params
    const newFetchOptions = {
      ...fetchOptions,
      headers: { ...fetchOptions.headers, Authorization: this.authToken },
    }
    return [newFetchOptions, ...restParams]
  }

  didReceiveResponse(response, args) {
    if (isError(response)) {
      return { ...response, isError: true, message: response.detail }
    }
    return response
  }
}

export default CommerceSDK

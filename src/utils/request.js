import axios from 'axios'
import qs from 'qs'
// import md5 from 'js-md5'
// import JsEncrypt from 'jsencrypt'

// 实例化一个JSEncrypt对象
// let jse = new JsEncrypt()
// const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
// MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCiwJbb2EeK9ZB4Chyj5/mIVPRE
// od0pJrv3LM2UVtkod+2mPVjV9Xi1E06gUaoexX/ebfRXm1eBwu3LtYbklh5Ji5oF
// ycoUCFhwzhmm8ZtjdkCIicFfxUU4I5NunL6+37+hy43EgCrao5tFgHtnkeR/vNyG
// faxdxevPbVEtWlJz6wIDAQAB
// -----END PUBLIC KEY-----`
// jse.setPublicKey(PUBLIC_KEY)

/* 通用设置 */
axios.defaults.timeout = 1000 * 100 //请求超时设置，10秒超时
axios.defaults.headers.post['Content-Type'] =
  'application/json' //设置数据格式//application/x-www-form-urlencoded
// axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.get['Content-Type'] =
  'application/json' //设置数据格式//application/x-www-form-urlencoded
// axios.defaults.headers.get['X-Requested-With'] = 'XMLHttpRequest'

axios.defaults.baseURL = `${import.meta.env.VITE_BASE_URL}/api` //api接口前缀
//请求拦截器
axios.interceptors.request.use(
  function (param) {
    //(此处可以放公共加载状态提示)
    //param.headers.Authorization ='xxxx';//设置token(需要配合vuex使用)
    return param
  },
  function (error) {
    // 请求错误
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      let res = response.data
      return Promise.resolve({ data: res })
    } else {
      //这个地方可以由后台编辑状态码区分不同情况，做不同的逻辑处理
      return Promise.reject(response)
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 封装axios--------------------------------------------------------------------------------------
function commonRequest(url, params) {
  let httpDefault = {
    method: 'POST',
    url: url,
    // data: qs.stringify(params)
    data: params,
  }
  return new Promise((resolve, reject) => {
    // console.log(httpDefault)
    axios(httpDefault)
      // 此处的.then属于axios
      .then((res) => {
        resolve(res.data)
      })
      .catch((response) => {
        reject(response)
      })
  })
}

export default {
  /**
   * get请求
   * @param {String} url 请求的url地址
   * @param {Object} params 请求提交的参数
   */
  get(url, params, config) {
    return new Promise((resolve, reject) => {
      config = config || {}
      config.params = params
      axios.get(url, config).then(
        (res) => {
          resolve(res.data)
        },
        (err) => {
          reject(err)
        }
      )
    })
  },
  /**
   * post请求
   * @param {String} url 请求的url地址
   * @param {Object} params 请求提交的参数
   */
  post(url, params, config) {
    return commonRequest(url, params, 'post', config)
  },
  /**
   * put请求
   * @param {String} url 请求的url地址
   * @param {Object} params 请求提交的参数
   */
  put(url, params, config) {
    return commonRequest(url, params, 'put', config)
  },
  /**
   * post请求
   * @param {String} url 请求的url地址
   * @param {Object} params 请求提交的参数
   */
  upload(url, params, config) {
    // let config = {
    //     headers: {
    //     'Content-Type': 'multipart/form-data'
    //     }
    // }
    // return commonRequest(url, params, 'post', config);
    return new Promise((resolve, reject) => {
      // console.log(httpDefault)
      axios({
        method: 'POST',
        url: url,
        data: params,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        // 此处的.then属于axios
        .then((res) => {
          resolve(res.data)
        })
        .catch((response) => {
          reject(response)
        })
    })
  },
  /**
   * delete请求
   * @param {String} url 请求的url地址
   * @param {Object} params 请求提交的参数
   */
  delete(url, params, config) {
    return new Promise((resolve, reject) => {
      config = config || {}
      config.params = params
      axios.delete(url, config).then(
        (res) => {
          resolve(res.data)
        },
        (err) => {
          reject(err)
        }
      )
    })
  },

  /**
   * patch请求
   * @param {String} url 请求的url地址
   * @param {Object} params 请求提交的参数
   */
  patch(url, params, config) {
    return commonRequest(url, params, 'patch', config)
  },

  /**
   * jsonp请求
   * @param {String} url 请求的url地址
   * @param {Object} params 请求提交的参数
   */
  jsonp(url, params) {
    return commonjsonpRequest(url, params)
  }
}

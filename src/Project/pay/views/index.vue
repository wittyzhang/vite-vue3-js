<template>
  <div class="repay repayment">
    <div class="repayment_con">
      <NavBar
        :title="isRollover ? 'Extension Repayment' : 'Immediate Repayment'"
        @back="back"
      ></NavBar>

      <div class="repayment_header_otc">
        <div
          class="repayment_header_item"
          :class="item.otc == curItem.otc && 'repayment_header_item_select'"
          v-for="(item, index) in headerList"
          :key="index"
          @click="toggle(item)"
        >
          {{ item.title }}
        </div>
      </div>
      <div class="repayment_main" v-if="resData">
        <!-- 线上还款 -->
        <div class="repayment_online" v-if="curItem.otc == 2">
          <div class="repayment_main_rollover_box" v-if="isRollover">
            <div class="repayment_main_rollover">
              <div class="repayment_main_rollover_title">
                Extension Repayment Amount
              </div>
              <div class="repayment_main_rollover_amout">
                ₵ {{ resData.amount }}
              </div>
            </div>

            <div class="repayment_main_rollover_time">
              <div class="repayment_main_rollover_item">
                <div class="repayment_main_rollover_label">
                  Start Time Of Extension Repayment
                </div>
                <div class="repayment_main_rollover_value">
                  {{ resData.startTime }}
                </div>
              </div>

              <div class="repayment_main_rollover_item">
                <div class="repayment_main_rollover_label">
                  End Time Of Extension Repayment
                </div>
                <div class="repayment_main_rollover_value">
                  {{ resData.endTime }}
                </div>
              </div>
            </div>
          </div>
          <div class="iframe_box iframe_sms_box">
            <!-- <div class="repayment_main_rollover" v-if="!isRollover">
              <div class="repayment_main_rollover_title">Repayment Amount</div>
              <div class="repayment_main_rollover_amout">
                ₵ {{ resData.amount }}
              </div>
            </div> -->
            <div class="iframe_sms_item">
              <div class="iframe_sms_title">Bank Name</div>
              <div class="iframe_sms_value" @click="showPicker">
                <div class="iframe_sms_value_text">
                  {{ presentForm.bank_name }}
                </div>
                <img
                  class="iframe_sms_value_img"
                  src="@/assets/picker.png"
                />
              </div>
            </div>
            <div class="iframe_sms_item">
              <div class="iframe_sms_title">Account No.</div>
              <div class="iframe_sms_value">
                <input
                  v-model="presentForm.card_no"
                  @input="inputCardNo"
                  maxlength="10"
                  class="iframe_sms_value_input"
                  type="text"
                />
              </div>
            </div>
            <div v-if="isModifyBool" class="iframe_sms_send">
              <div class="iframe_sms_name">OTP</div>
              <input
                v-model="presentForm.vcode"
                maxlength="6"
                class="iframe_sms_value_input"
                type="text"
              />
              <button
                @click="sendSms"
                class="iframe_sms_send_btn"
                :class="timer && 'iframe_sms_send_btn_select'"
              >
                {{ codeMsg }}
              </button>
            </div>
            <div class="iframe_sms_pay">
              <button
                @click="submit"
                class="iframe_sms_pay_btn iframe_sms_pay_btn_select"
              >
                Pay
              </button>
            </div>
          </div>
        </div>
        <!-- 非线上还款 -->
        <div class="repayment_offline" v-if="curItem.otc == 3">
          <div class="repayment_main_rollover_box" v-if="isRollover">
            <div class="repayment_main_rollover">
              <div class="repayment_main_rollover_title">
                Extension Repayment Amount
              </div>
              <div class="repayment_main_rollover_amout">
                ₵ {{ resData.amount }}
              </div>
            </div>

            <div class="repayment_main_rollover_time">
              <div class="repayment_main_rollover_item">
                <div class="repayment_main_rollover_label">
                  Start Time Of Extension Repayment
                </div>
                <div class="repayment_main_rollover_value">
                  {{ resData.startTime }}
                </div>
              </div>

              <div class="repayment_main_rollover_item">
                <div class="repayment_main_rollover_label">
                  End Time Of Extension Repayment
                </div>
                <div class="repayment_main_rollover_value">
                  {{ resData.endTime }}
                </div>
              </div>
            </div>
          </div>
          <div class="" v-if="!isRollover">
            <div class="repayment_main_rollover repayment_main_payment">
              <div class="repayment_main_rollover_title">Repayment Amount</div>
              <div class="repayment_main_rollover_amout">
                ₵ {{ resData.amount }}
              </div>
            </div>

            <div class="repayment_main_company">
              <div class="repayment_main_company_name">Company Name</div>
              <div class="repayment_main_company_desc">
                {{ resData.companyName }}
              </div>
            </div>
          </div>

          <div class="repayment_main_card">
            <div
              :class="['repayment_main_card_item', {'even': index%2 == 0}]"
              v-for="(item, index) in resData.bankAccountList"
              :key="index"
            >
              <div class="repayment_main_card_title">{{ item.bankName }}</div>
              <div class="repayment_main_card_num">{{ item.va }}</div>
              <div @click="onCopy(item.va)" class="repayment_main_card_btn">
                Copy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <van-popup v-model:show="pickerVisible" round position="bottom">
      <van-picker
        show-toolbar
        :columns="pickData"
        v-model="defaultIndex"
        :columns-field-names="{ text: 'label' }"
        @confirm="confirmPicker"
      />
    </van-popup>
  </div>
</template>
<script setup>
// import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showLoadingToast, showToast, closeToast } from 'vant'
import { throttle, copy } from '@/utils/index.js'
import http from '@/utils/request.js'
import NavBar from '../components/NavBar.vue'

// const basePayApi = 'https://app.dllkash.com'
const ONLINE = 2
const OFFLINE = 3

const route = useRoute()

let codeMsg = ref('Get OTP')
let timer = null
const countdown = ref(60)

const isRollover = ref(false)
const isModifyBool = ref(false)

const curItem = ref({ title: 'Online Repayment', otc: ONLINE })
const headerList = ref([
  { title: 'Online Repayment', otc: ONLINE },
  { title: 'Offline Repayment', otc: OFFLINE }
])

const resData = ref(null)
const bankCodeList = ref([])
const userCard = ref({})
const originalForm = ref({})
const presentForm = ref({})

const androidData = ref({})

const pickData = ref([])
const defaultIndex = ref([]) // 默认选择的
const pickerVisible = ref(false)

onMounted(() => {
  init()
  isRollover.value = route.query.vaType === 2
})
const popToOrder = () => {
  try {
    window['popToOrder'].postMessage('hello')
  } catch (error) {
    window.android.popToOrder()
  }
}
const init = () => {
  // 接收安卓传参
  window.config = function (prams) {
    let data = {}
    if (typeof prams == 'string') {
      data = JSON.parse(prams)
    } else {
      data = prams || {}
    }
    // 调试=====================>
    // console.log("安卓已调config", data);
    // data = {
    //   repayOffline: true,
    //   pkg_name: 'com.rapid.cashrapid',
    //   bank_code: '0026',
    //   baseUrl: 'https://app.dllkash.com/',
    //   amount: '18.20',
    //   app_version: '1.0.0',
    //   user_id: '220230606000000021',
    //   loginStaticKey: '7FE68A8F0C7A01C35F74DE17DB8BDDE1',
    //   version: '1.0.0',
    //   application_id: 'CR3020230606000018089',
    //   repayOnline: true,
    //   vaType: '1'
    // }
    // data = {
    //   repayOffline: true,
    //   pkg_name: 'com.axis.loanaxis',
    //   amount: '24.20',
    //   user_id: '220230601000000005',
    //   application_id: 'CR3020230613000018100',
    //   repayOnline: true,
    //   vaType: 1,
    //   baseUrl: 'https://app.dllkash.com'
    // }
    // data['baseUrl'] = basePayApi
    // <=====================调试

    androidData.value = data

    let list = []
    // 是否开启线上还款
    if (data.repayOnline) {
      list.push({ title: 'Online Repayment', otc: ONLINE })
    }
    // 是否开启线下还款
    if (data.repayOffline) {
      list.push({ title: 'Offline Repayment', otc: OFFLINE })
    }
    headerList.value = list
    curItem.value = list[0]

    isRollover.value = data.vaType == 2
    showLoading()
    try {
      window.android.submitAF('click_va')
    } catch (error) {}
    getva({
      ...data,
      atm_otc: curItem.value.otc,
      timestamp: Date.now()
    })
  }
  window.config()
}
// 获取页面详情
const getva = (data) => {
  http
    .post(androidData.value.baseUrl + '/api/loan/getva', data)
    .then((res) => {
      hideLoading()
      if (res.code == '200') {
        resData.value = res.result || {}
        if (data.atm_otc == ONLINE) {
          bankCode()
          queryUserCard()
        }
        try {
          window.android.submitAF('va_success')
        } catch (error) {}
      } else {
        showToast(res.message, 2000)
      }
    })
    .catch((err) => {
      console.log('err', err)
    })
}
// 获取银行卡列表
const bankCode = () => {
  http
    .post(androidData.value.baseUrl + '/api/query/bankcode', {
      ...androidData.value,
      pay_type: 1,
      timestamp: Date.now()
    })
    .then((res) => {
      if (res.code == '200') {
        bankCodeList.value = res.result
        pickData.value = []
        bankCodeList.value.forEach((v) => {
          pickData.value.push({
            label: v.bank_name,
            value: v.bank_code
          })
        })
        defaultIndex.value = [presentForm.bank_code]
        pickData.value = pickData.value
      }
      hideLoading()
    })
}
// 当前用户card
const queryUserCard = () => {
  http
    .post(androidData.value.baseUrl + '/api/user/queryUsercard', {
      ...androidData.value,
      timestamp: Date.now()
    })
    .then((res) => {
      userCard.value = res.result || []
      let { bank_code, bank_name, card_no } = userCard.value
      let form = {
        bank_code,
        bank_name,
        card_no,
        vcode: ''
      }
      originalForm.value = JSON.parse(JSON.stringify(form))
      presentForm.value = JSON.parse(JSON.stringify(form))
      hideLoading()
    })
}
// 支付
const repaymentSubmimt = () => {
  if (isModifyBool.value) {
    if (!presentForm.value.vcode) {
      showToast('Please enter the correct verification code.', 2000)
      return
    }
  }
  if (!presentForm.value.card_no || !presentForm.value.bank_code) {
    showToast('Please check whether the information is correct.', 2000)
    return
  }
  let data = androidData.value
  showLoading()
  http
    .post(data.baseUrl + '/api/loan/doRepayment', {
      ...data,
      atm_otc: curItem.value.otc,
      smsCode: presentForm.value.vcode,
      bankAccount: presentForm.value.card_no,
      bank_code: presentForm.value.bank_code,
      timestamp: Date.now()
    })
    .then((res) => {
      if (res.code == 200) {
        showToast('Successful repayment', 2000)
        setTimeout(() => {
          popToOrder()
        }, 2000)
      } else {
        showToast('Transaction failed,Please re -operation.', 2000)
      }
    })
    .catch((err) => {
      console.log('err', err)
    })
}
const submit = throttle(repaymentSubmimt, 3000)
// 发送短信
const sendSms = () => {
  let data = androidData.value
  let phone = presentForm.value.card_no
  if (!checkPhone(phone)) {
    showToast('Please check your bank account No.', 2000)
    return
  }
  if (!timer) {
    showLoading()
    http
      .post(data.baseUrl + '/api/register/app/sendSms', {
        ...data,
        phone,
        type: 28,
        timestamp: Date.now()
      })
      .then((res) => {
        if (res.message) {
          showToast(res.message, 2000)
        } else {
          hideLoading()
        }
        if (res.code == 200) {
          setTime()
          showToast('Send successfully', 2000)
        }
      })
  }
}
// 短信验证码倒计时
const setTime = () => {
  timer = setInterval(() => {
    if (countdown.value > 0 && countdown.value <= 60) {
      countdown.value--
      if (countdown.value !== 0) {
        codeMsg.value = countdown.value + 'S'
      } else {
        clearInterval(timer)
        codeMsg.value = 'Get OTP'
        countdown.value = 60
        timer = null
      }
    }
  }, 1000)
}
const isModify = () => {
  let bool = false
  if (presentForm.value.bank_code !== originalForm.value.bank_code) {
    bool = true
  }
  if (presentForm.value.bank_name !== originalForm.value.bank_name) {
    bool = true
  }
  if (presentForm.value.card_no !== originalForm.value.card_no) {
    bool = true
  }
  isModifyBool.value = bool
}
const inputCardNo = () => {
  isModify()
}
const checkSmsCode = () => {
  let data = androidData.value
  return new Promise((resolve, reject) => {
    hideLoading()
    if (!presentForm.value.vcode) {
      showToast('Please enter the correct verification code.', 2000)
      reject()
    }
    http
      .post(data.baseUrl + '/api/register/app/checkSmsCode', {
        ...data,
        phone: presentForm.value.card_no,
        smsCode: presentForm.value.vcode,
        type: 28,
        atm_otc: curItem.value.otc,
        timestamp: Date.now()
      })
      .then((res) => {
        if (res.message) {
          showToast(res.message, 2000)
        } else {
          hideLoading()
        }
        resolve(res.code)
      })
      .catch(() => {
        reject()
      })
  })
}
const checkWebsite = (str) => {
  // no-useless-escape
  let website =
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/
  return website.test(str)
}
const checkPhone = (value) => {
  if (value.length == 10 && value[0] == 0) {
    return true
  } else if (value.length == 9 && value[0] != 0) {
    return true
  }
  return false
}
const showPicker = () => {
  pickerVisible.value = true
}
const confirmPicker = (res) => {
  presentForm.value.bank_name = res.selectedOptions[0].label
  presentForm.value.bank_code = res.selectedOptions[0].value
  pickerVisible.value = false
  isModify()
}
const back = () => {
  try {
    window['FlutterClose'].postMessage('hello')
  } catch (error) {
    window.android.close()
  }
}

// 切换
const toggle = (item) => {
  curItem.value = item

  showLoading()
  resData.value = {}
  getva({
    ...androidData.value,
    atm_otc: item.otc,
    timestamp: Date.now()
  })
}
const showLoading = () => {
  showLoadingToast('Loading...')
}
const hideLoading = () => {
  closeToast()
}
const onCopy = (value) => {
  copy(value)
}
</script>

<style lang="scss" scoped>
.repayment {
  background: #fafafa;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .repayment_con {
    height: auto;
    padding-bottom: 20px;
    box-sizing: border-box;
    // background: url('../../assets/img/bgi@2x.png') no-repeat #ffffff;
    background: linear-gradient(#d4633b 0%, rgba(217, 217, 217, 0) 100%);
    background-size: 100% 100%;
  }

  .repayment_header {
    position: static;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 44px;

    .repayment_header_box {
      // position: absolute;
      // left: 0;
      // bottom: 0;
      width: 100%;
      height: 40px;
      padding: 0 24px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-align: center;

      .repayment_header_img {
        width: 24px;
        height: 24px;
      }

      .repayment_header_title {
        font-size: 18px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #ffffff;
        width: 100%;
      }
    }
  }

  .repayment_header_otc {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 20px;
    box-sizing: border-box;

    .repayment_header_item {
      margin-right: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;

      width: 160px;
      height: 44px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 20px;

      font-size: 15px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #999999;

      &:last-child {
        margin-right: 0;
      }
    }

    .repayment_header_item_select {
      position: relative;
      background: #ffffff;
      box-shadow: 0px 4px 6px 0px rgba(0, 0, 0, 0.06);
      border-radius: 20px;
      border: 2px solid #d4633b;
      color: #d4633b;
    }
  }

  .repayment_main {
    height: 100%;

    .repayment_online {
      height: 100%;
    }

    .repayment_main_rollover_box {
      margin: 20px;
      padding: 0 20px;
      // height: 180px;

      background: #ffffff;
      box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.02);
      border-radius: 20px;
      backdrop-filter: blur(9px);
    }

    .iframe_box {
      margin: 20px;
      height: 100%;
      background: #ffffff;
      box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.02);
      border-radius: 20px;
      backdrop-filter: blur(9px);
      overflow: hidden;
    }

    .iframe_sms_box {
      padding: 20px;
      //height: 500px;
      margin-bottom: 20px;

      .iframe_sms_item {
        margin-top: 10px;

        .iframe_sms_title {
          font-size: 16px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #333333;
        }

        .iframe_sms_value {
          display: flex;
          align-items: center;
          width: 100%;
          height: 40px;
          background: #f4f7fb;
          border-radius: 22px;
          padding: 0 20px;
          box-sizing: border-box;
          margin-top: 10px;

          .iframe_sms_value_text {
            width: 100%;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #d4633b;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .iframe_sms_value_img {
            width: 24px;
            height: 24px;
          }

          .iframe_sms_value_input {
            width: 100%;
            border: none;
            background-color: transparent;
            outline: none;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #d4633b;
          }
        }

        &:first-child {
          margin-top: 0;
        }
      }

      .iframe_sms_send {
        margin-top: 30px;
        display: flex;
        justify-content: center;
        align-items: center;

        height: 44px;
        background: #f4f7fb;
        border-radius: 22px;

        .iframe_sms_name {
          font-size: 14px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #999999;

          padding: 0 15px;
          border-radius: 1px;
          border-right: 2px solid rgba(255, 159, 58, 0.2);
        }

        .iframe_sms_value_input {
          width: 100%;
          border: none;
          background-color: transparent;
          outline: none;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #d4633b;
          padding: 0 10px;
        }

        .iframe_sms_send_btn {
          min-width: 70px;
          border: none;
          outline: none;
          padding: 4px 7px;
          box-sizing: border-box;

          background: #d4633b;
          border-radius: 22px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 20px;
        }

        .iframe_sms_send_btn_select {
          background: rgba(255, 159, 58, 0.5);
        }
      }

      .iframe_sms_pay {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 30px;

        .iframe_sms_pay_btn {
          border: none;
          outline: none;
          width: 220px;
          height: 44px;
          background: rgba(255, 159, 58, 0.5);
          border-radius: 25px;

          font-size: 16px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #ffffff;
        }

        .iframe_sms_pay_btn_select {
          background: #d4633b;
        }
      }
    }

    .repayment_main_rollover {
      height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      border-bottom: 1px dashed transparent;
      padding: 12px 0;
      box-sizing: border-box;

      background: linear-gradient(white, white) padding-box,
        repeating-linear-gradient(
          -45deg,
          #d4d7da 0,
          #d4d7da 5px,
          white 0,
          white 10px
        );

      .repayment_main_rollover_title {
        width: 100%;
        text-align: center;

        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #30414d;
      }

      .repayment_main_rollover_amout {
        width: 100%;
        text-align: center;

        font-size: 18px;
        font-family: Helvetica-Bold, Helvetica;
        font-weight: bold;
        color: #d4633b;
      }
    }

    .repayment_main_payment {
      background: none;
      margin: 20px;
      height: 90px;
      background: #ffffff;
      box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.06);
      border-radius: 24px;
    }

    .repayment_main_rollover_time {
      // height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      padding: 12px 0;
      box-sizing: border-box;

      .repayment_main_rollover_item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 5px 4px;

        // height: 20px;
        box-sizing: border-box;

        .repayment_main_rollover_label {
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #999999;
        }

        .repayment_main_rollover_value {
          text-align: right;
          width: 100px;
          font-size: 14px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #333333;
        }
      }
    }

    .repayment_main_company {
      padding: 20px;
      margin: 20px;
      margin-bottom: 28px;
      background: #ffffff;
      box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.02);
      border-radius: 20px;
      backdrop-filter: blur(9px);

      .repayment_main_company_name {
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #333333;
      }

      .repayment_main_company_desc {
        display: flex;
        align-items: center;
        margin-top: 10px;
        padding-left: 20px;

        height: 40px;
        background: #f4f7fb;
        border-radius: 22px;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #d4633b;
      }
    }

    .repayment_main_card {
      width: 100vw;
      box-sizing: border-box;

      .repayment_main_card_item {
        position: relative;
        background-repeat: no-repeat;

        flex-shrink: 0;
        margin: 0 20px;
        margin-bottom: 10px;
        height: 87px;
        background: linear-gradient(90deg, #ffdf8a 0%, #ffe4bb 100%);
        border-radius: 24px;

        box-sizing: border-box;
        padding: 20px;
        &.even {
          background: linear-gradient(90deg, #ffc8b1 0%, #ffc5be 100%);
        }

        .repayment_main_card_title {
          height: 26px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #e98011;
        }

        .repayment_main_card_num {
          height: 16px;
          margin-top: 5px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #e98011;
        }

        .repayment_main_card_btn {
          position: absolute;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          width: 60px;
          height: 26px;
          background: #ffffff;
          border-radius: 8px;
          font-size: 14px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #d4633b;

          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
}

//适配app 无法使用vh vw
.pickerbox {
  width: 100% !important;
  height: 100% !important;
}
</style>

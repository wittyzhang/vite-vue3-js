<template>
  <div>
    <van-nav-bar
      :title="title"
      left-arrow
      placeholder
      @click-left="onClickLeft"
    >
    </van-nav-bar>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: 'title'
    }
  },
  data() {
    return {}
  },
  methods: {
    onClickLeft() {
      this.$emit('back')
    }
  }
}
</script>
<style>
.van-nav-bar .van-icon,
.van-nav-bar__title {
  color: #ffffff;
  font-weight: normal;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.repay .van-nav-bar {
  /* background-color: #ffaf0e; */
  background-color: #d4633b;
  color: #ffffff;
}
.van-hairline--bottom::after {
  border-bottom-width: 0;
}
</style>

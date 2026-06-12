const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id } = event
  if (!id) {
    return { code: -1, message: '缺少 id 参数' }
  }

  try {
    const res = await db.collection('rock-records').doc(id).get()
    const data = {
      ...res.data,
      isLiked: (res.data.likedBy || []).includes(OPENID)
    }
    return { code: 0, data }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}

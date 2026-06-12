const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { page = 1, pageSize = 20 } = event

  try {
    const countRes = await db.collection('rock-records').count()
    const total = countRes.total

    const recordsRes = await db.collection('rock-records')
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    const data = recordsRes.data.map(r => ({
      ...r,
      isLiked: (r.likedBy || []).includes(OPENID)
    }))

    return { code: 0, data, total, page, pageSize }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}

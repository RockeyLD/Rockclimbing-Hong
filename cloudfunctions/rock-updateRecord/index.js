const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id, action, data = {} } = event
  if (!id || !action) {
    return { code: -1, message: '缺少 id 或 action 参数' }
  }

  try {
    if (action === 'like') {
      const record = await db.collection('rock-records').doc(id).get()
      const likedBy = record.data.likedBy || []
      const isLiked = likedBy.includes(OPENID)

      if (isLiked) {
        await db.collection('rock-records').doc(id).update({
          data: {
            likes: _.inc(-1),
            likedBy: _.pull(OPENID)
          }
        })
        return { code: 0, liked: false }
      } else {
        await db.collection('rock-records').doc(id).update({
          data: {
            likes: _.inc(1),
            likedBy: _.push(OPENID)
          }
        })
        return { code: 0, liked: true }
      }
    }

    if (action === 'update') {
      const updateData = {}
      const allowedFields = ['content', 'grade', 'location', 'date', 'mediaList']
      allowedFields.forEach(key => {
        if (data[key] !== undefined) updateData[key] = data[key]
      })
      await db.collection('rock-records').doc(id).update({ data: updateData })
      return { code: 0 }
    }

    return { code: -1, message: '未知的 action' }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}

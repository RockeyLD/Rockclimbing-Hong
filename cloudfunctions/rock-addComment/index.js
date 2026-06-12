const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { recordId, content, author } = event
  if (!recordId || !content) {
    return { code: -1, message: '缺少 recordId 或 content 参数' }
  }

  const comment = {
    _id: `cmt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    _openid: OPENID,
    author: author || '攀岩小达人',
    content,
    createTime: db.serverDate()
  }

  try {
    await db.collection('rock-records').doc(recordId).update({
      data: {
        comments: _.push(comment)
      }
    })
    return { code: 0, data: comment }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}

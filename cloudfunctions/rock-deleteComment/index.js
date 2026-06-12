const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { recordId, commentId } = event
  if (!recordId || !commentId) {
    return { code: -1, message: '缺少 recordId 或 commentId 参数' }
  }

  try {
    const record = await db.collection('rock-records').doc(recordId).get()
    const comments = record.data.comments || []
    const newComments = comments.filter(c => c._id !== commentId)

    await db.collection('rock-records').doc(recordId).update({
      data: { comments: newComments }
    })
    return { code: 0 }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}

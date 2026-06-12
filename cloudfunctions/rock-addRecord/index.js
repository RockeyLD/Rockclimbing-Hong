const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { content, mediaList, grade, location, date, type = 'image', author } = event

  if (!content && (!mediaList || mediaList.length === 0)) {
    return { code: -1, message: '内容和媒体不能同时为空' }
  }

  try {
    const res = await db.collection('rock-records').add({
      data: {
        _openid: OPENID,
        author: author || '攀岩小达人',
        content: content || '',
        mediaList: mediaList || [],
        grade: grade || '',
        location: location || '未知地点',
        date: date || new Date().toISOString().split('T')[0],
        type,
        likes: 0,
        likedBy: [],
        comments: [],
        createTime: db.serverDate()
      }
    })
    return { code: 0, data: { _id: res._id } }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}

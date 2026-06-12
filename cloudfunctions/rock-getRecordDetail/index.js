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
    let mediaUrls = res.data.mediaList || []
    if (mediaUrls.length > 0 && typeof mediaUrls[0] === 'string' && mediaUrls[0].startsWith('cloud://')) {
      try {
        const tempRes = await cloud.getTempFileURL({ fileList: mediaUrls })
        mediaUrls = tempRes.fileList.map(f => f.tempFileURL || f.fileID)
      } catch (e) {
        console.error('getTempFileURL error:', e)
      }
    }
    const data = {
      ...res.data,
      isLiked: (res.data.likedBy || []).includes(OPENID),
      mediaUrls
    }
    return { code: 0, data }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}

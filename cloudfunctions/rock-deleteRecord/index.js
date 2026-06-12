const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { id } = event
  if (!id) {
    return { code: -1, message: '缺少 id 参数' }
  }

  try {
    const record = await db.collection('rock-records').doc(id).get()
    const mediaList = record.data.mediaList || []
    const fileIDList = mediaList.filter(url => url.startsWith('cloud://'))

    if (fileIDList.length > 0) {
      await cloud.deleteFile({ fileIDList })
    }

    await db.collection('rock-records').doc(id).remove()
    return { code: 0 }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}

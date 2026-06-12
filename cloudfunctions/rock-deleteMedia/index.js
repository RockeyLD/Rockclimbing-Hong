const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { fileIDList } = event
  if (!fileIDList || !Array.isArray(fileIDList) || fileIDList.length === 0) {
    return { code: -1, message: '缺少 fileIDList 参数' }
  }

  try {
    const res = await cloud.deleteFile({ fileIDList })
    return { code: 0, deleted: res.fileList }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}

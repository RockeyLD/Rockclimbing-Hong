const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { fileContent, cloudPath } = event
  if (!fileContent || !cloudPath) {
    return { code: -1, message: '缺少 fileContent 或 cloudPath 参数' }
  }

  try {
    const buffer = Buffer.from(fileContent, 'base64')
    const res = await cloud.uploadFile({
      cloudPath: `rock-climbing/${cloudPath}`,
      fileContent: buffer
    })
    return { code: 0, fileID: res.fileID }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}

const uuid = require('uuid')
const path = require('path')
const Analytics = require('analytics-node')
const getConfig = require('../config/getConfig')
const fileExists = require('../fs/fileExists')
const readFile = require('../fs/readFile')

// commented out because fetching location adds 1-2 seconds delay
// do we want it for tracking?
// const getLocation = require('./getLocation')

module.exports = async (eventName, data = {}) => {
  const trackingFilePath = path.resolve(__dirname, '..', '..', '..', 'tracking-config.json')
  const { trackingDisabled, frameworkId, userId } = await getConfig()

  // exit early if tracking disabled
  if (trackingDisabled || !await fileExists(trackingFilePath)
    || process.env.CI || process.env.TRAVIS) {
    return
  }

  const { segmentWriteKey } = await readFile(trackingFilePath) // eslint-disable-line

  if (!segmentWriteKey) return

  const analytics = new Analytics(segmentWriteKey)


  if (!eventName) {
    throw new Error('Please provide an event name for tracking')
  }


  const payload = {
    event: eventName,
    userId: userId || uuid.v1(),
    // location: await getLocation(),
    properties: { frameworkId, ...data }
  }

  return analytics.track(payload)  // eslint-disable-line
}
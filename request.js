const path = require('path')
const fs = require('fs')
const { google } = require('googleapis')
const { GOOGLE_API_KEY, TARGET_CHANNEL_ID: channelId } = process.env

const youtube = google.youtube({
  version: 'v3',
  auth: GOOGLE_API_KEY
})

let count1 = 0
const COUNT_LIMIT = 100

const sleep = sec =>
  new Promise((resolve, reject) => setTimeout(resolve, sec * 1000))

const main = async () => {
  let nextPageToken = void 0
  let videos = []
  do {
    console.log('requesting videos: page-' + (count1 + 1))
    const { data } = await youtube.search.list({
      part: 'id,snippet',
      channelId,
      maxResults: 50,
      pageToken: nextPageToken
    })
    count1++
    nextPageToken = data.nextPageToken
    videos = [...videos, ...data.items]
    count1 % 10 === 0 && (await sleep(2))
  } while (!!nextPageToken && count1 < COUNT_LIMIT)

  videos = videos
    .filter(x => x.id.kind === 'youtube#video')
    .map(video => ({
      id: video.id.videoId,
      publishedAt: video.snippet.publishedAt,
      title: video.snippet.title
    }))

  let count2 = 0
  const result = []
  for (video of videos) {
    console.log(`requesting video statistics: ${count2 + 1}/${videos.length}`)
    const { statistics } = await youtube.videos
      .list({
        part: 'statistics',
        id: video.id,
        maxResult: 1
      })
      .then(({ data }) => data.items[0])
    count2++
    count2 % 10 === 0 && (await sleep(2))
    result.push({
      ...video,
      statistics: { ...statistics, receivedAt: new Date().toISOString() }
    })
  }

  fs.writeFileSync(
    path.join(__dirname, 'output_requested.json'),
    JSON.stringify(result)
  )
}

main()

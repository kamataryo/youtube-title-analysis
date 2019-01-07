const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const kuromoji = require('kuromoji')
const DIC_DIR = path.join(__dirname, 'node_modules', 'kuromoji', 'dict')

const parse = phrase =>
  new Promise((resolve, reject) =>
    kuromoji.builder({ dicPath: DIC_DIR }).build((error, tokenizer) => {
      if (error) {
        reject(error)
      }
      const path = tokenizer.tokenize(phrase)
      resolve(path)
    })
  )

const transform = video => ({
  duration:
    new Date(video.statistics.receivedAt) / 1000 -
    new Date(video.publishedAt) / 1000,
  viewCount: parseInt(video.statistics.viewCount)
})

const main = async () => {
  const videos = JSON.parse(
    fs
      .readFileSync(path.join(__dirname, 'output_requested.json'))
      .toString('utf-8')
  )

  const result = []
  let count = 0
  for (video of videos) {
    count++
    console.log(`Analyzing ${count} of ${videos.length}`)
    result.push({
      ...transform(video),
      words: (await parse(video.title))
        .filter(x => x.pos === '名詞')
        .map(x => x.surface_form)
    })
  }

  fs.writeFileSync(
    path.join(__dirname, 'output_parsed.json'),
    JSON.stringify(result)
  )
}

main()

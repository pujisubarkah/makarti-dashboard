declare module 'wordcloud' {
  interface WordCloudOptions {
    list: [string, number][]
    gridSize?: number
    weightFactor?: (size: number) => number
    fontFamily?: string
    color?: () => string
    rotateRatio?: number
    backgroundColor?: string
    minSize?: number
    drawOutOfBound?: boolean
    shrinkToFit?: boolean
  }

  function WordCloud(canvas: HTMLCanvasElement, options: WordCloudOptions): void
  export default WordCloud
}

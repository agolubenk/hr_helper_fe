import type { Variable } from './types'

function substituteVariables(html: string, variables: Variable[]): string {
  let result = html
  variables.forEach((variable) => {
    const regex = new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g')
    result = result.replace(
      regex,
      `<span style="background-color: #fff3cd; padding: 2px 4px; border-radius: 3px; font-weight: 500;">${variable.value}</span>`
    )
  })
  return result
}

const DOCX_WRAPPER_STYLES = `
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
    body { font-family: 'Times New Roman', 'Liberation Serif', serif; line-height: 1.5; color: #000; background: white; display: block; }
    .docx-wrapper { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 25.4mm 31.7mm; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); transform-origin: top center; overflow: visible; box-sizing: border-box; display: block; }
    @media screen and (max-width: 768px) { .docx-wrapper { width: 100%; padding: 15mm 20mm; } }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }
    p { margin: 1em 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    table td, table th { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    table th { background-color: #f5f5f5; font-weight: 600; }
    img { max-width: 100% !important; height: auto !important; margin: 1em 0; display: block; }
    .docx-wrapper img { width: auto; max-width: 100%; }
    ul, ol { margin: 1em 0; padding-left: 2em; }
    blockquote { border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0; color: #666; }
    code { background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    pre { background-color: #f5f5f5; padding: 1em; border-radius: 4px; overflow-x: auto; }
  </style>
  <div class="docx-wrapper">
`

export async function processDocxPreview(file: File, variables: Variable[]): Promise<string> {
  const mammoth = (await import('mammoth')).default
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  let html = result.value
  html = DOCX_WRAPPER_STYLES + html + '</div>'
  return substituteVariables(html, variables)
}

const PPTX_SLIDE_STYLES = `
  <style>
    * { box-sizing: border-box; }
    body { background: #f0f0f0; padding: 0; margin: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; overflow: visible; }
    .slides-wrapper { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 20px; gap: 20px; }
    .slide-container { width: 960px; height: 540px; padding: 40px 60px; border: 1px solid #ddd; border-radius: 8px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; flex-direction: column; justify-content: flex-start; position: relative; aspect-ratio: 16/9; max-width: 100%; max-height: 100%; transform-origin: center top; flex-shrink: 0; }
    .slide-number { font-size: 12px; color: #999; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
    .slide-content { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .slide-content p { margin: 12px 0; line-height: 1.6; }
    .slide-content h1, .slide-content h2, .slide-content h3 { margin: 20px 0 12px 0; font-weight: 600; }
    .slide-content table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    .slide-content table td, .slide-content table th { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    .slide-content table th { background-color: #f5f5f5; font-weight: 600; }
    .slide-content img { max-width: 100%; height: auto; margin: 16px 0; border-radius: 4px; }
    .slide-content ul, .slide-content ol { margin: 12px 0; padding-left: 2em; }
  </style>
  <div style="padding: 20px; background: #f5f5f5; min-height: 100vh;">
  <div class="slides-wrapper">
`

export async function processPptxPreview(file: File, variables: Variable[]): Promise<string> {
  const JSZip = (await import('jszip')).default
  const arrayBuffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  const imageMap = new Map<string, string>()
  const mediaFiles = Object.keys(zip.files).filter(
    (name) =>
      name.startsWith('ppt/media/') &&
      (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif'))
  )
  for (const mediaFile of mediaFiles) {
    try {
      const imageBlob = await zip.files[mediaFile].async('blob')
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(imageBlob)
      })
      const fileName = mediaFile.split('/').pop() ?? ''
      imageMap.set(fileName, base64)
    } catch {
      // ignore
    }
  }

  const slideFiles = Object.keys(zip.files)
    .filter((name) => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] ?? '0', 10)
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] ?? '0', 10)
      return numA - numB
    })

  let htmlContent = PPTX_SLIDE_STYLES
  const parser = new DOMParser()

  for (let i = 0; i < Math.min(slideFiles.length, 50); i++) {
    const slideFile = slideFiles[i]
    const content = await zip.files[slideFile].async('string')
    const xmlDoc = parser.parseFromString(content, 'text/xml')

    htmlContent += `<div class="slide-container">`
    htmlContent += `<div class="slide-number">Слайд ${i + 1} из ${slideFiles.length}</div>`
    htmlContent += `<div class="slide-content">`

    const paragraphs = xmlDoc.getElementsByTagName('a:p')
    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const paragraph = paragraphs[pIdx]
      const textRuns = paragraph.getElementsByTagName('a:r')
      if (textRuns.length === 0) {
        htmlContent += '<p style="margin: 8px 0;">&nbsp;</p>'
        continue
      }
      let paragraphContent = ''
      for (let r = 0; r < textRuns.length; r++) {
        const run = textRuns[r]
        const textNode = run.getElementsByTagName('a:t')[0]
        if (textNode) {
          let text = textNode.textContent ?? ''
          const rPr = run.getElementsByTagName('a:rPr')[0]
          if (rPr) {
            const isBold = rPr.getAttribute('b') === '1'
            const isItalic = rPr.getAttribute('i') === '1'
            if (isBold) text = `<strong>${text}</strong>`
            if (isItalic) text = `<em>${text}</em>`
          }
          paragraphContent += text
        }
      }
      if (paragraphContent.trim()) {
        htmlContent += `<p style="margin: 12px 0; line-height: 1.6;">${substituteVariables(paragraphContent, variables)}</p>`
      }
    }

    const tables = xmlDoc.getElementsByTagName('a:tbl')
    for (let t = 0; t < tables.length; t++) {
      const table = tables[t]
      htmlContent += '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">'
      const rows = table.getElementsByTagName('a:tr')
      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx]
        const isHeader = rowIdx === 0
        htmlContent += '<tr>'
        const cells = row.getElementsByTagName('a:tc')
        for (let c = 0; c < cells.length; c++) {
          const cell = cells[c]
          const cellTexts = cell.getElementsByTagName('a:t')
          let cellContent = ''
          for (let ct = 0; ct < cellTexts.length; ct++) {
            cellContent += cellTexts[ct].textContent ?? ''
          }
          cellContent = substituteVariables(cellContent, variables)
          const tag = isHeader ? 'th' : 'td'
          htmlContent += `<${tag} style="border: 1px solid #ddd; padding: 8px 12px;">${cellContent || '&nbsp;'}</${tag}>`
        }
        htmlContent += '</tr>'
      }
      htmlContent += '</table>'
    }

    htmlContent += `</div></div>`
  }

  if (slideFiles.length === 0) {
    htmlContent += '<div class="slide-container"><p style="color: #666;">Не удалось найти слайды в файле</p></div>'
  }

  htmlContent += '</div></div>'
  return htmlContent
}

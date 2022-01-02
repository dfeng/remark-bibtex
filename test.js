const remark = require('remark')
const footnotes = require('remark-footnotes')
const remarkBibtex = require('./index.js')

const bibtexFilePath = './example/example.bib'

test('Infer citation A', async () => {
  return remark()
    .use(footnotes)
    .use(remarkBibtex, { bibtexFile: bibtexFilePath })
    .process('[@Wasserman1994]')
    .then((content) => content.toString())
    .then((markdown) => {
      expect(markdown).toBe(
        '<span class="citation">(Wasserman & Faust, 1994)</span>[^Wasserman1994]\n\n[^Wasserman1994]: Wasserman, S. & Faust, K., 1994. Social Network Analysis, Cambridge: Cambridge University Press.\n'
      )
    })
    // .catch((err) => console.error(err))
})

test('Infer citation B', async () => {
  return remark()
    .use(footnotes)
    .use(remarkBibtex, { bibtexFile: bibtexFilePath })
    .process('[@Harris2020]')
    .then((content) => content.toString())
    .then((markdown) => {
      expect(markdown).toBe(
        '<span class="citation">(Harris et al., 2020)</span>[^Harris2020]\n\n[^Harris2020]: Harris, C.R. et al., 2020. Array programming with NumPy. Nature, 585(7825), pp.357–362. Available at: http://www.nature.com/articles/s41586-020-2649-2.\n'
      )
    })
    // .catch((err) => console.error(err))
})

test('Infer citation A in context', async () => {
  return remark()
    .use(footnotes)
    .use(remarkBibtex, { bibtexFile: bibtexFilePath, numbers: false })
    .process('# My Document\n\nSo here is my citation [@Wasserman1994]. End of story.\n\n')
    .then((content) => content.toString())
    .then((markdown) => {
      expect(markdown).toBe(
        '# My Document\n\nSo here is my citation <span class="citation">(Wasserman & Faust, 1994)</span>[^Wasserman1994]. End of story.\n\n[^Wasserman1994]: Wasserman, S. & Faust, K., 1994. Social Network Analysis, Cambridge: Cambridge University Press.\n'
      )
    })
    // .catch((err) => console.error(err))
})

test('Infer citations A & B', async () => {
  return remark()
    .use(footnotes)
    .use(remarkBibtex, { bibtexFile: bibtexFilePath })
    .process('Ref A: [@Harris2020] Ref B: [@Wasserman1994]')
    .then((content) => content.toString())
    .then((markdown) => {
      expect(markdown).toBe(
        'Ref A: <span class="citation">(Harris et al., 2020)</span>[^Harris2020] Ref B: <span class="citation">(Wasserman & Faust, 1994)</span>[^Wasserman1994]\n\n[^Harris2020]: Harris, C.R. et al., 2020. Array programming with NumPy. Nature, 585(7825), pp.357–362. Available at: http://www.nature.com/articles/s41586-020-2649-2.\n\n[^Wasserman1994]: Wasserman, S. & Faust, K., 1994. Social Network Analysis, Cambridge: Cambridge University Press.\n'
      )
    })
    // .catch((err) => console.error(err))
})
test('Infer citations A & B with reverse order and duplicate entry', async () => {
  return remark()
    .use(footnotes)
    .use(remarkBibtex, { bibtexFile: bibtexFilePath })
    .process('Ref A: [@Wasserman1994] Ref B: [@Harris2020] Ref C: [@Wasserman1994]')
    .then((content) => content.toString())
    .then((markdown) => {
      expect(markdown).toBe(
        'Ref A: <span class="citation">(Wasserman & Faust, 1994)</span>[^Wasserman1994] Ref B: <span class="citation">(Harris et al., 2020)</span>[^Harris2020] Ref C: <span class="citation">(Wasserman & Faust, 1994)</span>[^Wasserman1994]\n\n[^Wasserman1994]: Wasserman, S. & Faust, K., 1994. Social Network Analysis, Cambridge: Cambridge University Press.\n\n[^Harris2020]: Harris, C.R. et al., 2020. Array programming with NumPy. Nature, 585(7825), pp.357–362. Available at: http://www.nature.com/articles/s41586-020-2649-2.\n'
      )
    })
    // .catch((err) => console.error(err))
})

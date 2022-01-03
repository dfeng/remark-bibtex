const citejs = require('citation-js')
const fs = require('fs')
const visit = require('unist-util-visit')
module.exports = plugin

function plugin(pluginOptions) {
  // the bibtex filepath is mandatory
  if (!('bibtexFile' in pluginOptions))
    throw new Error(
      'Options requires a "bibtexFile" key with a filepath to the .bib file as a value.'
    )
  // regex for identifying citation keys - use double escape to prevent prettier auto-removing
  const regexp = new RegExp('\\[\\@(.*?)\\]')
  const regexp2 = new RegExp('^\\@(.*?)$')
  // transformer
  async function transformer(markdownAST) {
    // read-in bibtex
    const bibtexFile = await fs.promises.readFile(pluginOptions.bibtexFile, 'utf8')
    // this is the citation-js instance
    const citations = new citejs(bibtexFile)
    // keep track of unique references
    const uniqueCiteRefs = []
    // visit nodes to find and extract citations
    visit(markdownAST, (node, idx, parent) => {
      if (node.type !== "text" && node.type !== "linkReference") return
      // extract the starting and ending string indices for found citation keys
      if (node.type === "text")
        var match = node.value.match(regexp)
      else
        var match2 = node.label.match(regexp2)
      // abort if no matches found
      if (!match && !match2) return
      // we find a @ in a linkreference
      if (!match && match2) {
        var citeRef = match2[1]
        console.log(citeRef)
        var newChildren = []
        newChildren.push({
          type: 'text',
          value: citations.format('citation', { entry: citeRef })
        },
        {
          type: 'footnoteReference',
          identifier: citeRef,
          label: citeRef,
        })
      } else {
        // split existing child into new children
        const citeStartIdx = match.index
        const citeEndIdx = match.index + match[0].length
        var newChildren = []
        // if preceding string
        if (citeStartIdx !== 0) {
          // create a new child node
          newChildren.push({
            type: 'text',
            value: node.value.slice(0, citeStartIdx).trimEnd() + " ",
          })
        }
        // create the citation reference
        var citeRef = match[1]
        // newChildren.push({
        //   type: 'html',
        //   value: '<span class="citation">'
        // })
        newChildren.push({
          type: 'text',
          value: citations.format('citation', {entry: citeRef})
        })
        // newChildren.push({
        //   type: 'html',
        //   value: '</span>'
        // })
        // add
        const citeNode = {
          type: 'footnoteReference',
          identifier: citeRef,
          label: citeRef,
        }
        newChildren.push(citeNode)
        // if trailing string
        if (citeEndIdx < node.value.length) {
          newChildren.push({
            type: 'text',
            value: node.value.slice(citeEndIdx),
          })
        }
      }
      // let footnoteKey
      // label depends if new or not
      if (!uniqueCiteRefs.includes(citeRef)) {
        // footnoteKey = uniqueCiteRefs.length + 1
        uniqueCiteRefs.push(citeRef)
        // } else {
        //   footnoteKey = uniqueCiteRefs.indexOf(citeRef) + 1
      }
      // insert into the parent
      parent.children = [
        ...parent.children.slice(0, idx),
        ...newChildren,
        ...parent.children.slice(idx + 1),
      ]
    })
    // add the footnotes
    // generate the bib text
    // https://citation.js.org/api/0.3/tutorial-output_formats.html
    const citedText = citations
      .format('bibliography', {
        format: 'text',
        template: 'harvard1',
        entry: uniqueCiteRefs,
        nosort: true,
      })
      .split('\n')
    uniqueCiteRefs.forEach((citeRef, idx) => {
      // add to footnotes
      markdownAST.children.push({
        type: 'footnoteDefinition',
        identifier: citeRef,
        label: citeRef,
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: citedText[idx],
              },
            ],
          },
        ],
      })
    })
    return markdownAST
  }
  return transformer
}

const REMOVED_SELECTOR = 'style, script, meta, link, title, xml';
const NORMAL_WEIGHT = /font-weight:\s*(normal|[1-4]00)/i;
const BOLD_WEIGHT = /font-weight:\s*(bold|[6-9]00)/i;

const unwrap = (element: Element) => element.replaceWith(...element.childNodes);

export const cleanPastedHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll(REMOVED_SELECTOR).forEach((element) => element.remove());

  const comments = doc.createTreeWalker(doc.body, NodeFilter.SHOW_COMMENT);
  const found: Node[] = [];
  for (let node = comments.nextNode(); node; node = comments.nextNode()) found.push(node);
  found.forEach((node) => node.parentNode?.removeChild(node));

  doc.querySelectorAll('b, strong').forEach((element) => {
    const isDocsWrapper = element.id.startsWith('docs-internal-guid');
    if (isDocsWrapper || NORMAL_WEIGHT.test(element.getAttribute('style') ?? '')) unwrap(element);
  });
  doc.querySelectorAll('span').forEach((element) => {
    if (!BOLD_WEIGHT.test(element.getAttribute('style') ?? '')) return;
    const strong = doc.createElement('strong');
    strong.append(...element.childNodes);
    element.replaceWith(strong);
  });
  doc.querySelectorAll('[style], [class], [id], [lang], [dir]').forEach((element) => {
    for (const name of ['style', 'class', 'id', 'lang', 'dir']) element.removeAttribute(name);
  });
  return doc.body.innerHTML;
};

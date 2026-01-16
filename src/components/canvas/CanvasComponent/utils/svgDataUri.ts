export const decodeDataUri = (href: string) => {
  try {
    const base64 = href.split(',')[1];
    return decodeURIComponent(escape(atob(base64)));
  } catch {
    return '';
  }
};

export const toDataUri = (svgText: string) => {
  try {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;
  } catch {
    return '';
  }
};

export const tintSvgText = (svgText: string, color: string) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const paths = Array.from(doc.querySelectorAll('path'));
    paths.forEach(path => {
      path.setAttribute('fill', color);
    });
    return new XMLSerializer().serializeToString(doc.documentElement);
  } catch {
    return svgText
      .replace(/stroke="[^"]*"/g, `stroke="${color}"`)
      .replace(/(fill=")(?!=none")[^"]*"/g, `$1${color}"`)
      .replace(/stroke%3D%22[^%]*%22/g, `stroke%3D%22${encodeURIComponent(color)}%22`)
      .replace(/fill%3D%22(?!none)[^%]*%22/g, `fill%3D%22${encodeURIComponent(color)}%22`);
  }
};

export const tintDataUri = (href: string, color: string) => {
  if (!href.startsWith('data:image/svg+xml')) return href;
  try {
    const decoded = decodeDataUri(href);
    const tinted = tintSvgText(decoded, color);
    return toDataUri(tinted) || href;
  } catch {
    return href;
  }
};

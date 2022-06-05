export function saveToXmlFile(text) {
  const blob = new Blob([text], { type: 'text/xml' });
  const tempLink = document.createElement('a');
  tempLink.download = 'schema';
  tempLink.href = URL.createObjectURL(blob);
  tempLink.dataset.downloadurl = ['text/xml', tempLink.download, tempLink.href].join(':');
  tempLink.style.display = "none";
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  setTimeout(function() { URL.revokeObjectURL(tempLink.href); }, 1500);
}

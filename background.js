browser.runtime.onMessage.addListener(data => {
  if (data.url.startsWith('data:')) {
    data.url = URL.createObjectURL(dataURItoBlob(data.url));
    setTimeout(() => {
      // yeah, it's a bit hacky
      URL.revokeObjectURL(data.url);
    }, 10000);
  }
  browser.downloads.download(data);
});

function dataURItoBlob(dataURI) {
  // https://stackoverflow.com/a/27781331/5114473
  if (typeof dataURI !== 'string') {
    throw new Error('Invalid argument: dataURI must be a string');
  }
  dataURI = dataURI.split(',');
  var type = dataURI[0].split(':')[1].split(';')[0],
    byteString = atob(dataURI[1]),
    byteStringLength = byteString.length,
    arrayBuffer = new ArrayBuffer(byteStringLength),
    intArray = new Uint8Array(arrayBuffer);
  for (var i = 0; i < byteStringLength; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  return new Blob([intArray], {
    type: type,
  });
}

'use strict';

browser.runtime.onMessage.addListener(data => {
  if (data.url.startsWith('data:')) {
    console.log(data.url);
    data.url = URL.createObjectURL(dataURItoBlob(data.url));
    console.log(data.url);
    setTimeout(() => {
      // yeah, it's a bit hacky
      URL.revokeObjectURL(data.url);
    }, 10000);
  }
  browser.downloads.download(data);
});

function dataURItoBlob(dataUri) {
  if (typeof dataUri !== 'string') {
    throw new Error('Invalid argument: dataURI must be a string');
  }

  const dataUriParts = dataUri.split(',');
  const type = dataUriParts[0].split(':')[1].split(';')[0];

  if (type.startsWith('text')) {
    return new Blob([decodeURIComponent(dataUriParts[1])], { type: type });
  }

  const byteString = atob(dataUriParts[1]),
    byteStringLength = byteString.length,
    arrayBuffer = new ArrayBuffer(byteStringLength),
    intArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteStringLength; ++i) {
    intArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([intArray], {
    type: type,
  });
}

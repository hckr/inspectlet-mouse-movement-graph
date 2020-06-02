const buttons = document.querySelector('.actionbuttons');

const downloadGraphElement = document.createElement('a');
downloadGraphElement.title = 'Download mouse graph';
downloadGraphElement.innerHTML = '<i class="fa fa-download"></i></a>';

downloadGraphElement.onclick = async () => {
  const data = await getJsonData();

  console.log(data);

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const { contentWindow: iWindow } = document.querySelector('#yoursite');

    try {
      const insp_tracker = iWindow.document.getElementById('insp_tracker');
      const insp_cursor = iWindow.document.getElementById('insp_cursor');
      insp_tracker.parentNode.removeChild(insp_tracker);
      insp_cursor.parentNode.removeChild(insp_cursor);
    } catch (err) {}

    const {
      offsetWidth: width,
      offsetHeight: height,
    } = iWindow.document.documentElement;

    canvas.width = width;
    canvas.height = height;

    ctx.drawWindow(iWindow, 0, 0, width, height, '#fff');

    ctx.strokeStyle = 'red';
    ctx.font = '18px sans-serif';

    let i = 1,
      prevX,
      prevY,
      prevTextI = i,
      prevTextX,
      prevTextY;
    for (const [ms, x, y] of data) {
      if (
        !(prevTextX || prevTextY) ||
        Math.abs(prevTextX - x) > 50 ||
        Math.abs(prevTextY - y) > 50
      ) {
        const text = `${i - prevTextI > 1 ? `${prevTextI + 1}–${i}` : i}`;
        const { width: tw } = ctx.measureText(text);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y - 14, tw, 16);
        ctx.fillStyle = 'magenta';
        ctx.fillText(text, x, y);
        prevTextI = i;
        prevTextX = x;
        prevTextY = y;
      }

      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
      ctx.stroke();

      if (prevX && prevY) {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      i = i + 1;
      prevX = x;
      prevY = y;
    }

    window.open(canvas.toDataURL());
  } catch (err) {
    console.error(err);
  }
};

buttons.appendChild(downloadGraphElement);

async function getJsonData() {
  // wid, sid, rid are global
  const { wid, rid } = window.wrappedJSObject;

  try {
    const data = await (
      await content.fetch(
        `https://www.inspectlet.com/dashboard/pdata?wid=${wid}&rid=${rid}`
      )
    ).json();

    return data
      .map(str => str.split(','))
      .filter(([op]) => op === 'mr')
      .map(([, timestamp, , , x, y]) => [+timestamp, +x, +y])
      .filter(([, x, y]) => !isNaN(x) && !isNaN(y))
      .reduce((acc, [timestamp, x, y], i, arr) => {
        const [prev_timestamp] = arr[i - 1] || [0];
        return [...acc, [timestamp - prev_timestamp, x, y]];
      }, []);
  } catch (err) {
    console.error('[inspectlet-mouse-movement-graph]', err);
    alert('[inspectlet-mouse-movement-graph] Something went wrong :/');
  }
}

'use strict';

const AGGREGATION_RADIUS = 25;

const buttons = document.querySelector('.actionbuttons');

const downloadCsv = document.createElement('a');
downloadCsv.title = 'Download CSV';
downloadCsv.innerHTML = '<i class="fa fa-file-text-o"></i>';

buttons.appendChild(downloadCsv);

downloadCsv.onclick = async () => {
  const csv = await fetchDataAndConvertToCsv();
  const dataUri = `data:text/csv,${encodeURIComponent(csv)}`;
  download(dataUri, 'csv');
};

const downloadGraphElement = document.createElement('a');
downloadGraphElement.title = 'Download mouse graph';
downloadGraphElement.innerHTML = '<i class="fa fa-download"></i>';

buttons.appendChild(downloadGraphElement);

downloadGraphElement.onclick = async () => {
  try {
    const data = aggregateCloseDataPoints(
      await fetchAndPreprocessData(),
      AGGREGATION_RADIUS
    );

    const max_ms = Math.max(...data.map(([ms]) => ms));

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

    ctx.font = '18px sans-serif';

    let i = 1,
      prev_x,
      prev_y,
      texts = [];
    for (const [ms, x, y] of data) {
      if (prev_x && prev_y) {
        ctx.beginPath();
        ctx.moveTo(prev_x, prev_y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'red';
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(x, y, AGGREGATION_RADIUS, 0, 2 * Math.PI, false);
      ctx.fillStyle = `rgba(255, 0, 0, ${Math.round((ms / max_ms) * 10) / 10})`;
      ctx.fill();
      ctx.strokeStyle = 'red';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'magenta';
      ctx.fill();

      texts.push([`${i}; ${Math.round(ms / 10) / 100} s`, x, y]);

      i = i + 1;
      prev_x = x;
      prev_y = y;
    }

    for (const [text, x, y] of texts) {
      const { width: tw } = ctx.measureText(text);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(x, y - 14, tw, 16);
      ctx.strokeStyle = 'white';
      ctx.strokeRect(x, y - 14, tw, 16);
      ctx.fillStyle = 'navy';
      ctx.fillText(text, x, y);
    }

    download(canvas.toDataURL(), 'png');
  } catch (err) {
    console.error(err);
    alert(
      `[inspectlet-mouse-movement-graph] Something went wrong :/

      Try again?`
    );
  }
};

/**
 * @param {Array<[number, number, number]>} data
 * @param {number} threshold
 *
 * @return {Promise<Array<[number, number, number]>>}
 * Sequence of [duration_in_ms, mouse_pos_x, mouse_pos_y]
 *
 */
function aggregateCloseDataPoints(data, threshold) {
  if (data.length === 0) {
    return [];
  }

  const aggregated = [];

  let candidates = [];

  const aggregate = () => {
    let sum_ms = 0,
      sum_x = 0,
      sum_y = 0;
    for (const [ms, x, y] of candidates) {
      sum_ms += ms;
      sum_x += x;
      sum_y += y;
    }
    aggregated.push([
      sum_ms,
      sum_x / candidates.length,
      sum_y / candidates.length,
    ]);
    candidates = [];
  };

  for (const current of data) {
    const [, x, y] = current;
    if (candidates.length !== 0) {
      const [, cand_x, cand_y] = candidates[0];
      if (
        Math.abs(cand_x - x) > threshold &&
        Math.abs(cand_y - y) > threshold
      ) {
        aggregate();
      }
    }
    candidates.push(current);
  }

  aggregate();

  return aggregated;
}

/**
 *
 * @return {Promise<Array<[number, number, number]>>}
 * Sequence of [duration_in_ms, mouse_pos_x, mouse_pos_y]
 */
async function fetchAndPreprocessData() {
  const data = await (await content.fetch(getDataUrl())).json();

  return data
    .map(str => str.split(','))
    .filter(([op]) => op === 'mr')
    .map(([, timestamp, , , x, y]) => [+timestamp, +x, +y])
    .filter(([, x, y]) => !isNaN(x) && !isNaN(y))
    .reduce((acc, [timestamp, x, y], i, arr) => {
      const [prev_timestamp] = arr[i - 1] || [0];
      return [...acc, [timestamp - prev_timestamp, x, y]];
    }, []);
}

async function fetchDataAndConvertToCsv() {
  const data = await (await content.fetch(getDataUrl())).json();
  console.log(data);
  return data.join('\n');
}

function getDataUrl() {
  // wid, sid, rid are global
  const {
    wid,
    rid,
    location: { protocol },
  } = window.wrappedJSObject;

  return `${protocol}//www.inspectlet.com/dashboard/pdata?wid=${wid}&rid=${rid}`;
}

function download(url, ext) {
  // wid, sid, rid are global
  const { wid, rid } = window.wrappedJSObject;

  browser.runtime.sendMessage({
    url,
    filename: `${wid}_${rid}.${ext}`,
  });
}

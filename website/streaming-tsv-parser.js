

// a TSV parser that parses the data incrementally in chunks
const tsvChunkedParser = () => {
  const textDecoder = new TextDecoder("utf-8");
  let columnHeadings;
  let previousChunk = "";

  return {
    parseChunk(chunk) {
      // decode and split into lines
      const textData = textDecoder.decode(chunk) + previousChunk;
      const lines = textData.split("\n");

      // the first line is our column headings
      if (!columnHeadings) {
        columnHeadings = lines[0].split("\t");
        lines.shift();
      }
      // the last line is probably partial - so append to the next chunk
      previousChunk = lines.pop();

      // convert each row to an object
      const items = lines
        .map(row => {
          const cells = row.split("\t");
          if (cells.length !== columnHeadings.length) {
            return null;
          }
          let rowValue = {};
          columnHeadings.forEach((h, i) => {
            rowValue[h] = cells[i];
          });
          return rowValue;
        })
        .filter(i => i);

      return items;
    }
  };
};


onmessage = async ({ data: filename }) => {
  let totalBytes = 0;

  const tsvParser = tsvChunkedParser();
  const response = await fetch(filename);
  // const thresholds = await fetch("infercnv.heatmap.thresholds.txt");

  if (!response.body) {
    throw Error("ReadableStream not yet supported in this browser.");
  }

  const thresholds = await fetch('infercnv.heatmap_thresholds.txt')
  const thresholdsData = await thresholds.text()
  const thresholdsArray = thresholdsData.split('\n').filter(Boolean).map(Number)

  const streamedResponse = new Response(
    new ReadableStream({
      start(controller) {
        const reader = response.body.getReader();

        const read = async () => {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          const items = tsvParser.parseChunk(value);

          totalBytes += value.byteLength;
          postMessage({ items, totalBytes });

          controller.enqueue(value);
          read();
        };

        read();
      }
    })
  );

  const data = await streamedResponse.text();

  postMessage({ items: [], totalBytes: data.length, thresholds: thresholdsArray, finished: true });
};

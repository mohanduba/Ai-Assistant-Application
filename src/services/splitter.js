function splitText(text, chunkSize = 300) {

    const chunks = [];

    let start = 0;

    while (start < text.length) {

        chunks.push(
            text.substring(start, start + chunkSize)
        );

        start += chunkSize;

    }

    return chunks;
}

module.exports = splitText;
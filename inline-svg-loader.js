// eslint-disable-next-line @typescript-eslint/no-require-imports
const { optimize } = require("svgo");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const svgToMiniDataURI = require("mini-svg-data-uri");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { imageSize } = require("image-size");

module.exports = function (content) {
    this.cacheable?.();
    const optimized = optimize(content);
    const src = svgToMiniDataURI(optimized.data);
    const { width, height } = imageSize(Buffer.from(content));
    const result = { src, width, height };
    return `export default ${JSON.stringify(result)};`;
};
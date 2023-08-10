export const webglColor = color => {
  const { r, g, b, opacity } = d3.color(color).rgb();
  return [r / 255, g / 255, b / 255, opacity];
};

  export const findAllSwitchIndices = (arr) => {
    const switchIndices = [];
    arr.findIndex((value, index) => {
      if (index !== 0 && value.chr !== arr[index - 1].chr) {
        switchIndices.push(value.x);
      }
    });
    return switchIndices;
  }

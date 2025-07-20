const escapeHTML = (str) =>
    str.replace(/([<>'"&])/g, (_, l) => `&#${l.charCodeAt(0)};`),
  overrideFunction = function (func, overrider) {
    const ogFunction = func;
    return function (...args) {
      return overrider.call(this, ogFunction.bind(this), ...args);
    };
  },
  defined = (x) => typeof x != "undefined" && x != null,
  hex2Hsl = (hex) => {
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length == 4 || hex.length == 5) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7 || hex.length == 9) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      h,
      s,
      l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [h, s, l];
  },
  hsl2Hex = (h, s, l) => {
    let r, g, b;
    if (s == 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s,
        p = 2 * l - q,
        hue2Rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
      r = hue2Rgb(p, q, h + 1 / 3);
      g = hue2Rgb(p, q, h);
      b = hue2Rgb(p, q, h - 1 / 3);
    }
    r = Math.round(r * 255)
      .toString(16)
      .padStart(2, "0");
    g = Math.round(g * 255)
      .toString(16)
      .padStart(2, "0");
    b = Math.round(b * 255)
      .toString(16)
      .padStart(2, "0");
    return `#${r}${g}${b}`;
  };

export {
  escapeHTML,
  overrideFunction,
  defined,
  hex2Hsl,
  hsl2Hex,
};
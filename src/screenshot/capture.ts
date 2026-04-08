import type { ClientErrorsSanitizeConfig, ClientErrorsScreenshotCaptureContext } from "../types";
import { applyDomSanitization } from "../sanitize/core";
import { safeCallAsync } from "../utils/safe-run";

const collectStyleText = (): string => {
  if (typeof document === "undefined") {
    return "";
  }

  return Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");
};

const buildSvgMarkup = (
  html: string,
  cssText: string,
  width: number,
  height: number
): string => `\
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;overflow:hidden;background:#fff;">
      <style>${cssText}</style>
      ${html}
    </div>
  </foreignObject>
</svg>`;

const loadSvgAsImage = (svgMarkup: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Screenshot image could not be loaded."));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  });

const renderDomScreenshot = async (
  context: ClientErrorsScreenshotCaptureContext
): Promise<string | null> => {
  if (
    typeof document === "undefined" ||
    typeof window === "undefined" ||
    typeof XMLSerializer === "undefined"
  ) {
    return null;
  }

  const body = document.body;

  if (!body) {
    return null;
  }

  const clone = body.cloneNode(true);

  if (!(clone instanceof HTMLElement)) {
    return null;
  }

  applyDomSanitization(clone, context.sanitize);

  const width = Math.min(window.innerWidth || 1280, context.maxWidth ?? 1440);
  const height = Math.min(window.innerHeight || 720, context.maxHeight ?? 1200);
  const serializer = new XMLSerializer();
  const html = serializer.serializeToString(clone);
  const cssText = collectStyleText();
  const svgMarkup = buildSvgMarkup(html, cssText, width, height);
  const image = await loadSvgAsImage(svgMarkup);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const drawingContext = canvas.getContext("2d");

  if (!drawingContext) {
    return null;
  }

  drawingContext.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL(
    context.format,
    context.format === "image/jpeg" ? context.quality : undefined
  );
};

export const captureScreenshot = async (
  screenshot: {
    enabled: boolean;
    format: "image/jpeg" | "image/png";
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    provider?: (context: ClientErrorsScreenshotCaptureContext) => string | null | Promise<string | null>;
  },
  sanitize: ClientErrorsSanitizeConfig
): Promise<string | null> => {
  if (!screenshot.enabled) {
    return null;
  }

  const context: ClientErrorsScreenshotCaptureContext = {
    format: screenshot.format,
    quality: screenshot.quality,
    maxWidth: screenshot.maxWidth,
    maxHeight: screenshot.maxHeight,
    sanitize
  };

  if (screenshot.provider) {
    return safeCallAsync(() => screenshot.provider?.(context) ?? null, null);
  }

  return safeCallAsync(() => renderDomScreenshot(context), null);
};

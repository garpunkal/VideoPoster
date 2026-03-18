import { describe, expect, it } from "vitest";
import { formatDuration, titleFromUrl } from "./utils.js";

describe("formatDuration", function () {
  it("returns placeholder for invalid durations", function () {
    expect(formatDuration(0)).toBe("--:--");
    expect(formatDuration(-8)).toBe("--:--");
    expect(formatDuration(Number.NaN)).toBe("--:--");
  });

  it("formats seconds under one hour", function () {
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(65)).toBe("1:05");
  });

  it("formats durations with hours", function () {
    expect(formatDuration(3601)).toBe("1:00:01");
    expect(formatDuration(7325)).toBe("2:02:05");
  });
});

describe("titleFromUrl", function () {
  it("extracts and normalizes filename from URL", function () {
    const url = "https://cdn.example.com/media/my-video_file-name.mp4";
    expect(titleFromUrl(url)).toBe("my video file name");
  });

  it("returns fallback title for invalid URLs", function () {
    expect(titleFromUrl("not-a-url")).toBe("Video");
  });
});

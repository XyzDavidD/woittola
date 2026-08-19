const youtubeVideoIdPattern = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeVideoId(value: string) {
  const input = value.trim();
  if (!input) return null;

  try {
    const url = new URL(input);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
    let candidate = "";

    if (hostname === "youtu.be") {
      candidate = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (hostname === "youtube.com" || hostname === "youtube-nocookie.com") {
      if (url.pathname === "/watch") candidate = url.searchParams.get("v") ?? "";
      else {
        const [kind, id] = url.pathname.split("/").filter(Boolean);
        if (kind === "embed" || kind === "shorts" || kind === "live") candidate = id ?? "";
      }
    }

    return youtubeVideoIdPattern.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(value: string) {
  const videoId = getYouTubeVideoId(value);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}

/**
 * Offers a generated file to the user for saving.
 *
 * Inside the Claude Artifacts viewer, direct anchor-tag downloads are sandboxed and do
 * nothing — the viewer instead exposes a `downloads` capability (`window.claude.use`)
 * that shows a save confirmation. This tries that path first and falls back to a normal
 * browser download when the capability isn't present (i.e. running as a regular website).
 */

interface Candidate {
  filename: string;
  data: Blob;
}

interface DownloadsCapability {
  save: (req: { filename: string; data: Blob }) => Promise<{ status: 'saved' }>;
}

declare global {
  interface Window {
    claude?: { use: (name: string) => Promise<unknown> };
  }
}

export type OfferResult = 'saved' | 'declined' | 'downloaded' | 'failed';

/**
 * `candidates` are tried in order against the Claude downloads capability, since it only
 * accepts an allowlist of extensions — e.g. a `.doc` Word export falls back to `.html`,
 * which carries the same content. The browser-download fallback always uses the first
 * candidate.
 */
export async function offerFileDownload(candidates: Candidate[]): Promise<OfferResult> {
  const claude = window.claude;
  if (claude?.use) {
    const downloads = (await claude.use('downloads').catch(() => null)) as DownloadsCapability | null;
    if (downloads) {
      for (const candidate of candidates) {
        try {
          await downloads.save(candidate);
          return 'saved';
        } catch (err) {
          const code = (err as { code?: string } | undefined)?.code;
          if (code === 'declined') return 'declined';
          if (code === 'rejected_extension' || code === 'extension_not_enabled') continue;
          return 'failed';
        }
      }
      return 'failed';
    }
  }

  const primary = candidates[0];
  try {
    const url = URL.createObjectURL(primary.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = primary.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}

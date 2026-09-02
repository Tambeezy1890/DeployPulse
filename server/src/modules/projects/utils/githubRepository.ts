export function getGitHubRepoFullName(
  repositoryUrl?: string | null,
): string | null {
  if (!repositoryUrl) {
    return null;
  }

  try {
    const url = new URL(repositoryUrl.trim());

    if (url.hostname.toLowerCase() !== "github.com") {
      return null;
    }

    const pathParts = url.pathname
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .filter(Boolean);

    if (pathParts.length !== 2) {
      return null;
    }

    const owner = pathParts[0].toLowerCase();

    const repository = pathParts[1].replace(/\.git$/i, "").toLowerCase();

    if (!owner || !repository) {
      return null;
    }

    return `${owner}/${repository}`;
  } catch {
    return null;
  }
}

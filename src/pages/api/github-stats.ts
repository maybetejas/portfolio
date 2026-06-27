type GitHubRepo = {
  fork: boolean;
  pushed_at: string | null;
};

const fallback = {
  status: 'BUILDING',
  repos: 0,
  lastDeploy: null
};

export const GET = async () => {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'cockpit-github-stats'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch('https://api.github.com/users/teeshakhandale/repos?per_page=100&sort=pushed', {
      headers
    });

    if (!response.ok) {
      return Response.json(fallback);
    }

    const repos = await response.json() as GitHubRepo[];
    const publicRepos = repos.filter((repo) => !repo.fork);
    const latestRepo = publicRepos.find((repo) => repo.pushed_at);

    return Response.json({
      status: 'BUILDING',
      repos: publicRepos.length,
      lastDeploy: latestRepo?.pushed_at ?? null
    });
  } catch {
    return Response.json(fallback);
  }
};

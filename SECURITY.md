## Security: Exposed Credentials

If any Docker Hub access tokens or other credentials were shared accidentally, revoke them immediately and replace with new, least-privilege tokens.

Steps to revoke a Docker Hub token:

- Sign in to https://hub.docker.com
- Go to Account Settings → Security → Access Tokens
- Revoke the leaked token and create a new token with minimal required scope

Add credentials to GitHub Actions as repository secrets (do NOT commit tokens):

- Repo UI: Settings → Secrets and variables → Actions → New repository secret
  - `DOCKERHUB_USERNAME` = your Docker Hub username
  - `DOCKERHUB_TOKEN` = the new access token
- Or with GitHub CLI:

```bash
gh secret set DOCKERHUB_USERNAME --body "your-username"
gh secret set DOCKERHUB_TOKEN --body "<new-token>"
```

The CI workflow `.github/workflows/ci.yml` is configured to use these secrets for `docker/login-action@v2`.

Post-revocation checklist:
- Rotate affected tokens and enable 2FA on Docker Hub.
- Remove any plaintext tokens from local shells, editors, issue trackers, and chat logs.
- Review audit logs for suspicious activity.

If you want, I can help add the new secrets via `gh` CLI or open a PR with additional guidance.

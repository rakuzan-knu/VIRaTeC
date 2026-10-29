# Transactional email

The API sends two kinds of email: an email confirmation link after registration
(`/verify-email?token=…`) and a 6-digit password reset code. They are sent through the
**Gmail API** from a regular Gmail account (currently `coil.knu@gmail.com`), so no
domain or paid mail service is needed. Google signs the messages for `gmail.com`, so
they pass SPF/DKIM/DMARC checks at the recipient.

Gmail limits a consumer account to about 500 recipients a day. That is enough for
registration and recovery mail; it is not meant for newsletters.

## One-time setup

1. In [Google Cloud Console](https://console.cloud.google.com/), use the project that
   already holds the Google sign-in client, or create one.
2. **APIs & Services → Library** → enable **Gmail API**.
3. **APIs & Services → OAuth consent screen**: user type **External**, add the scope
   `https://www.googleapis.com/auth/gmail.send`, then **Publish app** (status
   _In production_). In _Testing_ status Google expires the refresh token after 7 days
   and email stops working. The app does not need Google verification while only the
   sender account authorizes it; Google shows an "unverified app" warning once, during
   step 5.
4. **Credentials → Create credentials → OAuth client ID**, type **Web application**,
   authorized redirect URI `https://developers.google.com/oauthplayground`.
   Prefer a separate client for Gmail in the existing project, leaving the website's
   sign-in client unchanged. Keep the client ID and client secret securely; Google
   only shows the secret when it is created.
5. Coordinate with the owner of the **sender account** (`coil.knu@gmail.com`) before
   they start: the authorization code is short-lived and can only be exchanged once.
   Send this URL, replacing `YOUR_CLIENT_ID` with the Gmail client's ID:

   ```text
   https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=https%3A%2F%2Fdevelopers.google.com%2Foauthplayground&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send&access_type=offline&prompt=consent
   ```

   The owner signs in as the sender, grants permission to send email, and returns the
   complete OAuth Playground redirect URL through the agreed private channel without
   clicking anything in Playground. They do not need the client secret.

   Immediately exchange the returned `code` at `https://oauth2.googleapis.com/token`
   using an `application/x-www-form-urlencoded` POST with `client_id`, `client_secret`,
   `redirect_uri=https://developers.google.com/oauthplayground`, and
   `grant_type=authorization_code`. Parse the redirect with `URL.searchParams.get('code')`
   (which decodes the query value once), then encode the POST body once with
   `URLSearchParams`. Do not double-encode `%2F` or log the code, secret, or token response.
   Save the returned `refresh_token` as `GMAIL_REFRESH_TOKEN`.

6. Set the API environment variables (root `.env` locally, the `api` service on Vercel):

   ```sh
   MAIL_FROM="VIRaTeC <coil.knu@gmail.com>"
   GMAIL_CLIENT_ID=…
   GMAIL_CLIENT_SECRET=…
   GMAIL_REFRESH_TOKEN=…
   FRONTEND_URL=https://viratec.vercel.app
   ```

   `MAIL_FROM` must be the account that issued the refresh token. `FRONTEND_URL` is the
   origin used to build confirmation links.

## Behaviour without configuration

- **Outside production** the API writes each email (including the link or code) to its
  log instead of sending it, so registration and recovery can be tested locally.
- **In production** sending endpoints answer `503 EMAIL_UNAVAILABLE`; registration still
  succeeds, and the user can request a new confirmation link later from the account page.

## Existing accounts at rollout

The migration confirms existing Google-only accounts. A linked Google account alone
does not prove ownership of the profile's email address, so accounts with a password
must confirm their email. Existing accounts retain their Google connection, second
factor and backup codes during password recovery. Only new, unverified registrations
can have untrusted credentials cleared when the email owner recovers the account.

Deploy the migration before the new API. It only adds fields and a token table, so
the previous API can keep running during the rollout. Keep the added fields and table
if rolling back the application; do not reverse the migration or remove user data.

## Rotation and moving to a domain

If the refresh token leaks, remove the app's access at
<https://myaccount.google.com/permissions> while signed in as the sender, then repeat
step 5. If the project later gets its own domain, replace `MailClient`
(`apps/backend/src/auth/mail.client.ts`) with an HTTP mail provider such as Resend that
sends from that domain; the rest of the flow stays the same.

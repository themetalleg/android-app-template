# Publishing checklist

This template supports Google Play and the Apple App Store through EAS. It does
not create accounts, accept store agreements, purchase memberships, supply legal
advice, or guarantee review approval. Store requirements change: verify the
[Google Play policies](https://play.google.com/about/developer-content-policy/)
and [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/)
for each release.

## 1. Identity, product, and policy

- [ ] Choose a real product with enough useful, original functionality for review.
      Do not submit the unchanged task sample or generic placeholder assets.
- [ ] Replace name, slug, scheme, package and bundle ID in [app.json](../app.json).
      Package/bundle identifiers must be unique and are effectively permanent.
- [ ] Replace **all** icons and splash artwork in [assets/](../assets/).
      Check Android adaptive/monochrome masks and Apple icon requirements.
- [ ] Set the initial version in app config. Subsequent store build numbers are
      incremented by EAS (`appVersionSource: remote`, `autoIncrement: true`).
      Keep the user-facing app and npm versions in sync when making releases.
- [ ] Customize and host a public HTTPS privacy policy and support page.
      Start from [the privacy template](PRIVACY-POLICY.template.md), but do not
      publish bracketed placeholders or claim data practices you have not verified.
- [ ] Set `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_SUPPORT_URL`, and
      `EXPO_PUBLIC_API_URL` in the production EAS environment.
- [ ] Review every native SDK, permission, backup behavior, privacy manifest,
      encryption/export declaration, and third-party data processor.
      The starter declares no non-exempt encryption; reassess that declaration
      if you introduce custom encryption.
- [ ] No camera, location, ads, notification, tracking, or user login capabilities
      are included. If adding them, also add purpose strings, consent, server
      support, tests, account/data deletion, and store declarations as needed.
- [ ] Review dependencies and licenses. Run `npm audit`; resolve/review advisories
      without forcing incompatible Expo or React versions.

## 2. Your own Expo project and signing

```sh
npx --yes eas-cli@25.2.0 login
npx --yes eas-cli@25.2.0 init
npx --yes eas-cli@25.2.0 build:configure
npx --yes eas-cli@25.2.0 credentials
```

Use your own Expo account/organization. `eas init` links this copy to your project.
Do not reuse the template author's project. Add `EAS_PROJECT_ID` only if you need
an environment override; otherwise the ID in app config is used.

Configure variables for each EAS environment:

```sh
npx --yes eas-cli@25.2.0 env:create --environment production \
  --name EXPO_PUBLIC_PRIVACY_URL --value https://YOUR-DOMAIN/privacy --visibility plaintext
```

Repeat for support/API URLs (and preview/development as needed).
Use EAS environment variables, not GitHub-only variables, for values required
inside the remote build. Production's post-install hook rejects placeholder
identity/URLs and a missing EAS project ID. `npm run release:check` checks the
current shell environment; load/export your values first for a local preflight.

Provision Android upload signing / iOS distribution credentials interactively
using EAS. Only then use non-interactive CI builds. Back up credentials securely
and know how to rotate/recover them. Never commit a keystore, private key,
service account JSON, Apple API key, `.env`, or `credentials.json`.

## 3. Test before release

- [ ] `npm ci && npm run check && npm run doctor && npm run export`
- [ ] Android CI job passes and debug APK installs.
- [ ] Test signed preview/production builds, not only Expo Go or Metro.
- [ ] Exercise add/toggle/delete, app restart persistence, dark/light/system,
      offline import, HTTP failures, deletion confirmation, and external links.
- [ ] Test Android hardware/predictive back, iOS gestures, safe areas, rotation
      behavior, keyboard, screen readers, large text, tablets if supported.
- [ ] Inspect generated Android permissions and iOS Info.plist/privacy manifests.
- [ ] Test deep links with your personalized scheme, and missing-route behavior.
- [ ] Review crash handling, startup migration errors, and database upgrades.
- [ ] Do not log or embed personal data or privileged credentials.

Preview:

```sh
npm run build:android:preview
npm run build:ios:preview
```

Android preview is an APK. iOS preview is a **simulator build**; physical iOS
internal testing requires a separate non-simulator profile with registered
devices and Apple provisioning, or use a production build through TestFlight.

## 4. Google Play

- [ ] Register/verify a personal Google Play developer account and pay the fee.
      Meet any identity/device verification and testing requirements for that account.
- [ ] Create the app in Play Console with the matching package ID.
- [ ] Configure Play App Signing and safeguard your upload key.
- [ ] Complete the [listing template](STORE-LISTING.template.md), screenshots,
      feature graphic, support/contact details, privacy URL, age/content rating,
      ads declaration, target audience, app access and Data safety forms.
      Base Data safety on actual behavior including every third-party SDK.
- [ ] Confirm the target API requirement in force on the submission date.
      Upgrade Expo/native dependencies if required; do not assume CI implies compliance.
- [ ] Build: `npm run build:android:production` (AAB, not APK).
- [ ] Upload the first release manually if required by the Play API. Then set up
      a least-privilege Google service account for EAS Submit if desired.
- [ ] Submit: `npm run submit:android`, selecting the exact intended build.
      The provided submission profile targets **internal testing**, not production.
- [ ] Meet closed-testing requirements if applicable; promote to production
      deliberately in Play Console after testing and policy review.

## 5. Apple App Store

- [ ] Join Apple Developer Program, complete agreements, and create the app in
      App Store Connect with the matching bundle ID.
- [ ] Set up distribution signing/provisioning and App Store Connect credentials.
- [ ] Build: `npm run build:ios:production`.
- [ ] Submit: `npm run submit:ios`; provide your own App Store Connect app ID and
      credentials when prompted (or configure `ascAppId` in your own EAS profile).
- [ ] Test through TestFlight, including on physical devices.
- [ ] Complete screenshots for supported device families, description, support
      and privacy URLs, age rating, App Privacy nutrition labels, export compliance,
      rights, reviewer notes and demo access if applicable.
- [ ] Validate required-reason API declarations and privacy manifests generated by
      the selected Expo/native SDKs against your actual usage.
- [ ] Submit for App Review manually in App Store Connect. Uploading a binary
      does not publish it or automatically request review.

## 6. Operations after launch

- [ ] Decide who monitors crashes, user support, policy changes, signing/account
      access, dependencies, API uptime, and incident handling.
- [ ] Tag the exact released commit and keep release notes.
- [ ] Increment versions; test migrations on real existing user databases.
- [ ] Add OTA updates only deliberately, with compatible runtime/version rules,
      staged rollout, testing, and rollback planning.

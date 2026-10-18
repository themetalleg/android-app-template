# Android / iOS App Template

A reusable **React Native + Expo + TypeScript** foundation maintained by
[themetalleg](https://github.com/themetalleg). Use GitHub's **Use this template**
button for each new app instead of repeating the setup.

This is a working starter, **not a store-ready product or a promise of approval**.
Branding, legal text, developer accounts, signing credentials, store declarations,
and testing on real devices are intentionally yours to supply.

## Included

- Android and iOS from one codebase, Expo development builds, and file-based tabs.
- Offline task sample: create, complete, delete, and clear tasks in SQLite.
- Versioned database migration; parameterized SQL; typed repository interfaces.
- Lightweight dependency injection through React context, replaceable in tests.
- Optional HTTPS import example with validation, a timeout, and visible errors.
- Persisted system/light/dark appearance; safe areas and accessible controls.
- Loading, empty, failure, retry, not-found, and root error-boundary states.
- Jest unit/component tests with enforced coverage, actual SQLite integration
  tests, TypeScript and ESLint checks.
- GitHub CI with Android debug APK artifact; manually triggered EAS cloud builds.
- VS Code tasks, extension recommendations, Dependabot, MIT license.
- EAS development, preview, and store profiles, production placeholder checks,
  and [publishing](docs/PUBLISHING.md) / [privacy](docs/PRIVACY-POLICY.template.md) /
  [store listing](docs/STORE-LISTING.template.md) templates.

No login backend, analytics, ads, payments, push notifications, OTA updates, or
tracking are preconfigured. Add these only when needed, with appropriate consent,
permissions, credentials, and policy updates.

## Quick start

Install Git and Node.js (the exact tested version is in [.nvmrc](.nvmrc)).
With `nvm` available:

```sh
git clone https://github.com/YOUR_ACCOUNT/YOUR_NEW_APP.git
cd YOUR_NEW_APP
nvm install
nvm use
npm ci
cp .env.example .env
npm start
```

Use a development build for reliable native testing:

```sh
# Android: install Java 21, Android Studio + SDK, then start an emulator
# or connect a device with USB debugging enabled.
npm run android

# iOS: macOS + Xcode + CocoaPods required for local native builds.
npm run ios
```

Set `JAVA_HOME`, `ANDROID_HOME`, and add the SDK's `platform-tools` to `PATH`.
Install the SDK platform/build tools requested by the generated Gradle project;
do not guess a fixed Android API version for future Expo SDK upgrades.

`npm start` starts Metro for a development client. Expo Go can be used with
`npx expo start --go` only if its installed SDK matches this project and supports
the included native modules. Cloud builds do not require a local SDK or Mac.

## Make it yours

1. Create a repository using **Use this template**. It has its own history and
   does not share this repository's issues, credentials, or EAS project.
2. Change the npm package name in [package.json](package.json); run `npm install`
   to update the lockfile.
3. Edit [app.json](app.json): app name, slug, scheme, Android package, iOS bundle
   identifier, version, icons, splash, and tablet support.
4. Replace the images in [assets/](assets/). The bundled Expo template artwork is
   **placeholder artwork**, including adaptive and monochrome Android icons.
5. Set your API/privacy/support URLs in your local `.env` and the corresponding
   EAS environments. `EXPO_PUBLIC_*` values are public, embedded in the app.
6. Replace or remove the sample feature in [src/features/tasks/](src/features/tasks/).
   Change the import disclosure text if you change the API host.
7. Follow [PUBLISHING.md](docs/PUBLISHING.md) to link your own Expo project and
   configure credentials. No account IDs or signing keys are shared by this template.

App identity is intentionally in static [app.json](app.json).
[app.config.ts](app.config.ts) only adds an optional `EAS_PROJECT_ID` override.
`eas init` can also write the ID into `expo.extra.eas.projectId` in the JSON file.

## Everyday commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start Metro |
| `npm run android` / `npm run ios` | Build and run the native development app |
| `npm run check` | Types, lint, tests with coverage, release-validator tests |
| `npm test -- --watch` | Watch unit and component tests |
| `npm run test:integration` | Exercise migrations and repositories against real SQLite |
| `npm run doctor` | Expo dependency/configuration checks |
| `npm run export` | Compile Android and iOS production JS/assets (not binaries) |
| `npm run build:android:preview` | EAS installable Android APK |
| `npm run build:ios:preview` | EAS iOS **simulator** build (not a device IPA) |
| `npm run build:android:production` | Signed Google Play AAB |
| `npm run build:ios:production` | Signed App Store build |
| `npm run release:check` | Reject incomplete production identity/URLs/project ID |

In VS Code use **Terminal > Run Task** for six everyday tasks: **Start app**,
**Run Android**, **Run iOS (macOS)**, **Check everything**, **Watch tests**, and
**Expo Doctor**. **Ctrl+Shift+B** builds and runs Android; **Run Test Task** runs
all quality checks. Automatic npm task discovery is disabled in this workspace
to keep the menu focused. All npm scripts remain available from the terminal.
For one-time setup, cloud builds, and store submissions, use the commands above
and the [publishing guide](docs/PUBLISHING.md).

## Project layout

```text
src/app/              Expo Router layouts, tabs, settings and not-found screen
src/features/tasks/   Sample screen, using injected services
src/data/             SQLite migration/repositories and HTTPS client
src/services.tsx      Service composition root and typed context
src/theme.tsx         Persisted appearance + navigation theme
src/ui.tsx            Small shared UI primitives
src/__tests__/        Repository, networking, and component tests
scripts/              Production configuration validator and its tests
.vscode/              Tasks, recommendations, workspace settings
.github/              CI, manual EAS build workflow, dependency updates
docs/                 Publishing and editable policy/store templates
```

Native `android/` and `ios/` folders are generated by Expo prebuild and ignored.
Make durable native changes through app config/config plugins. Prebuild can
update npm scripts. Do not keep manual native edits unless you deliberately
switch to a committed-native-project workflow. Never use `prebuild --clean`
while relying on uncommitted manual native edits.

## CI and credentials

CI runs without store credentials and builds a debug-signed, **arm64-only APK**
for smoke testing (not a universal release). Download it from the workflow's
artifacts; it needs Metro to run. iOS compilation still needs macOS/Xcode or EAS.

The optional **EAS cloud build** workflow needs an `EXPO_TOKEN` secret in the
selected GitHub environment (`preview` or `production`), your own EAS project,
and credentials provisioned interactively first. Set `EAS_PROJECT_ID` as a GitHub
environment variable if it is not in app config. Protect the production environment
with reviewer approval if available on your GitHub plan. EAS may have charges.
The workflow builds only: it never auto-submits.

Dependencies are locked in [package-lock.json](package-lock.json). Use `npm ci`
in automation and `npx expo install` for Expo/React Native dependency upgrades.
Review `npm audit` results, including build-tool advisories, before each release.
Do not use `npm audit fix --force`: it can downgrade/break the Expo SDK family.
At initial setup, npm still reported upstream transitive advisories involving
`braces`, `node-forge`, `sprintf-js`, and older `uuid` versions after compatible
fixes were applied. This is not a clean dependency-security certification;
review their current exposure and upstream fixes before shipping.

## Data and security boundaries

SQLite is a full embedded relational database, not a JSON or key/value-store
substitute. It runs directly on Android/iOS with transactions and persistent
tables; no database server or internet connection is needed. The integration
tests exercise the same migration/repository SQL using Node's SQLite driver;
native device tests are still required for the Expo adapter and OS behavior.

Tasks and appearance live in an **unencrypted** SQLite database. No network
request happens until the user taps **Import demo task**, which sends a GET to
JSONPlaceholder by default; task contents are not uploaded. The provider still
receives normal request metadata such as the IP address. Android backup is
disabled; iOS device/iCloud backup behavior is OS-managed and must be considered
in your policy. Deleting all tasks leaves appearance settings intact.

Do not put tokens in `.env`, app config, or source. `EXPO_PUBLIC_*` is not secret
storage. Use a backend for privileged credentials, and an OS-backed secure
storage module for per-user tokens if you add authentication.

The validator checks configuration, not legal correctness, artwork, server
availability, native behavior, signing, or store compliance. Always run real
Android/iOS device tests and complete the release checklist.

## License

[MIT](LICENSE). Original Expo template attribution is retained.

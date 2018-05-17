# Contributing to duil

_This document is a work in progress._

## Making a Release

### Create a release branch
The final steps of a release should take place on a branch with the name `release-x.y.z` where `x.y.z` is the [Semantic Version] of the release.

```bash
git checkout -b release-X.Y.Z
```

[Semantic Version]: http://semver.org/spec/v2.0.0.html

### Update the version number
Make sure to update the version number in these places:

1. `package.json` in the `version` field.
2. `README.md` in the urls for the `[badge-version]` and `jsDelivr`.
3. `CHANGELOG.md` for the unreleased changes.

### Re-create all build assets
Make sure to rebuild `dist` and `docs` and run all tests and coverage **after** you have updated the version.

```bash
yarn all
```

### Update `CHANGELOG.md`
Follow the instructions in `CHANGELOG.md` and document all the significant changes that occured. Create a new blank entry for unreleased changes.

### Commit, merge, and tag all the changes
```bash
git commit -am "bump: version [skip ci]"
git checkout master
git merge --no-ff release-x.y.z
git tag x.y.z
```

### Merge into production and delete the release branch
```bash
git checkout production
git merge --no-ff master
git checkout master
git branch -d release-x.y.z
```

### Push to GitHub and create a new release
**NOTE**: The name of the release should be `x.y.z` with no leading `v`.

Use the relevant portion of the `CHANGELOG.md` as the release notes.

### Success!
You've successfully made a release.

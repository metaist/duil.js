# Contributing to duil

_This document is a work in progress._

## Making a Release

### Create a release branch
The final steps of a release should take place on a branch with the name `release-x.y.z` where `x.y.z` is the [Semantic Version] of the release.

```bash
git checkout -b release-x.y.z
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

### Merge into `master`
Commit all the changes and try to merge into `master`:
```bash
git commit -am "bump: version"
git checkout master
git merge --no-ff release-x.y.z
```

If all goes well, tag the release, push `master` and tags, and delete the release branch:
```bash
git tag x.y.z
git push --tags
git push origin master
git branch -d release-x.y.z
```

### Merge into `production`
Now just make a copy of the latest code in `production`:
```bash
git checkout production
git merge --no-ff master
git push origin production
git checkout master
```

### Publish on `npm`
```bash
yarn publish
```

For the new version number, simply re-type the prompted version number.

### Create a GitHub Release
1. [Draft a new release](https://github.com/metaist/duil.js/releases/new)
2. Select the tag you just pushed.
3. The name of the release should be the same as the version number (no leading `v`).
4. Use the relevant portion of the `CHANGELOG.md` as the release notes.
5. Drag and drop the contents of the `/dist` folder into the assets.
6. Press `Publish release`.

### Success!
You've successfully made a release.

### Post-Release Version Bump
Update `package.json` and add a `-dev` to the `version` field to indicate that this is now the snapshot version and not a released version.

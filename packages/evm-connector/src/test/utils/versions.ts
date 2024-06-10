import { VERSIONS } from '../mocked-versions/versions-dictionary';

export class Utils {
  getVersions() {
    return VERSIONS;
  }

  static getLatestVersion() {
    return Object.keys(VERSIONS).reduce((prev, current) => {
      return VERSIONS[prev].generatedAt > VERSIONS[current].generatedAt
        ? prev
        : current;
    });
  }
}

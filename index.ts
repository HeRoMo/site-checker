import { SiteChecker, SiteInfo, SiteCheckerOptions } from './lib/SiteChecker';

export async function siteChecker(list: SiteInfo[], opts: SiteCheckerOptions): Promise<SiteInfo[]> {
  const sc = new SiteChecker(list, opts);
  return sc.run();
}

export { SiteChecker, SiteInfo, SiteCheckerOptions };

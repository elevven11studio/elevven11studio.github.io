/**
 * The WebGuard checks that run on a plain web page, bundled from the extension
 * source so the demo and the extension can never disagree. Only the offline
 * detectors are wired in: page, form, tracker and threat-list checks need the
 * extension itself.
 */
import { urlDetector } from '@ext/security/detectors/url-detector';
import { domainDetector } from '@ext/security/detectors/domain-detector';
import { brandDetector } from '@ext/security/detectors/brand-detector';
import { assess } from '@ext/security/risk';
import { analyzeUrl } from '@ext/security/url/analyze-url';
import { analyzePassword } from '@ext/security/password/strength';
import { hashPassword, fetchRange, matchSuffix } from '@ext/security/breach/pwned';
import { scanText, summarize, hasSeriousFinding } from '@ext/security/secrets/scan';
import { normalizeUrl } from '@shared/utilities';
import { PASSWORD_VERDICT_LABELS } from '@shared/constants';
import type { SecurityContext, SecuritySignal } from '@shared/types';

export async function checkLink(input: string) {
  const url = normalizeUrl(input);
  if (!url) return null;
  const hostname = new URL(url).hostname;
  const context: SecurityContext = { url, hostname, linkOnly: true };

  const results = await Promise.all(
    [urlDetector, domainDetector, brandDetector].map(async (detector) => {
      try {
        return await detector.analyze(context);
      } catch {
        return [] as SecuritySignal[];
      }
    }),
  );

  const parsed = analyzeUrl(url);
  return assess({
    hostname,
    url,
    signals: results.flat(),
    checks: [
      {
        id: 'https',
        label: 'Encrypted connection',
        status: parsed.isHttps ? 'pass' : parsed.domain.isPrivate ? 'unknown' : 'fail',
        note: parsed.isHttps ? 'HTTPS' : 'Not encrypted',
      },
    ],
  });
}

export function checkPassword(password: string) {
  const result = analyzePassword(password);
  return { ...result, label: PASSWORD_VERDICT_LABELS[result.verdict] };
}

export async function checkBreach(password: string) {
  try {
    const { prefix, suffix } = await hashPassword(password);
    return matchSuffix(await fetchRange(prefix), suffix);
  } catch {
    return { status: 'unavailable' as const };
  }
}

export function checkText(text: string) {
  const findings = scanText(text);
  return { findings, summary: summarize(findings), serious: hasSeriousFinding(findings) };
}

import { LOCALES, type Locale } from '@/shared/i18n';
import type { ContentIssue } from '@/shared/lib';
import { findContentType, findField } from './contentModel';
import { fieldText, typeName as localizedTypeName } from './fieldText';
import type { SiteEditorMessages } from './messages';
import type { EditorSelection } from './store';

export interface IssueLine {
  key: string;
  issue: ContentIssue;
  locales: Locale[];
}

export interface IssueGroup {
  key: string;
  selection: EditorSelection | null;
  lines: IssueLine[];
}

const GENERAL_GROUP = '';

const typeName = (contentTypeId: string | undefined, t: SiteEditorMessages) =>
  localizedTypeName(t.fields, contentTypeId, findContentType(contentTypeId)?.name);

const fieldName = (issue: ContentIssue, t: SiteEditorMessages) => {
  const { target } = issue;
  if (!target?.fieldId) return '';
  const field = findField(target.contentTypeId, target.fieldId);
  return field ? fieldText(t.fields, target.contentTypeId, field).label : target.fieldId;
};

const issueLocale = (issue: ContentIssue): Locale | undefined => {
  const locale = issue.target?.locale ?? issue.locale;
  if (!locale || !issue.target?.fieldId) return locale;
  const field = findField(issue.target.contentTypeId, issue.target.fieldId);
  return field && !field.localized ? undefined : locale;
};

export const groupIssues = (issues: readonly ContentIssue[]): IssueGroup[] => {
  const groups = new Map<string, IssueGroup>();
  for (const issue of issues) {
    const groupKey = issue.target?.entryId ?? GENERAL_GROUP;
    const group = groups.get(groupKey) ?? {
      key: groupKey,
      selection: issue.target ? { ...issue.target } : null,
      lines: [],
    };
    groups.set(groupKey, group);
    const key = [issue.kind, issue.target?.fieldId, issue.value, issue.count].join('|');
    const locale = issueLocale(issue);
    const line = group.lines.find((item) => item.key === key);
    if (!line) {
      group.lines.push({ key, issue, locales: locale ? [locale] : [] });
    } else if (locale && !line.locales.includes(locale)) {
      line.locales.push(locale);
      line.locales.sort((a, b) => LOCALES.indexOf(a) - LOCALES.indexOf(b));
    }
  }
  return [...groups.values()].sort(
    (a, b) => Number(a.key === GENERAL_GROUP) - Number(b.key === GENERAL_GROUP),
  );
};

export const issueGroupTitle = (
  group: IssueGroup,
  label: string | null | undefined,
  t: SiteEditorMessages,
) => (group.selection ? label || typeName(group.selection.contentTypeId, t) : t.issues.general);

export const issueText = (line: IssueLine, t: SiteEditorMessages) => {
  const { issue } = line;
  const text = t.issues;
  const field = fieldName(issue, t);
  const value = issue.value ?? '';
  const count = issue.count ?? 0;
  const base = (() => {
    switch (issue.kind) {
      case 'required':
        return text.required(field);
      case 'invalid':
        return text.invalid(field);
      case 'needsPageLink':
        return text.needsPageLink;
      case 'missingEntry':
        return text.missingEntry(typeName(value, t));
      case 'wrongEntryType':
        return text.wrongEntryType(typeName(value, t));
      case 'linkBothTargets':
        return text.linkBothTargets;
      case 'unknownPage':
        return text.unknownPage(value);
      case 'linkNoTarget':
        return text.linkNoTarget;
      case 'tooManyStats':
        return text.tooManyStats(count);
      case 'duplicateLayout':
        return text.duplicateLayout(value);
      case 'tableCells':
        return text.tableCells(count);
      case 'singleEntry':
        return text.singleEntry(typeName(value, t), count);
      case 'homeSeoMissing':
        return text.homeSeoMissing;
      case 'founderCount':
        return text.founderCount(count);
      case 'contactEmailMissing':
        return text.contactEmailMissing;
      case 'legalDocumentsMissing':
        return text.legalDocumentsMissing(value);
    }
  })();
  return line.locales.length > 0
    ? `${base} (${line.locales.map((locale) => t.locales[locale]).join(', ')})`
    : base;
};
